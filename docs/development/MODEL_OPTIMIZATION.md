# ONNX 模型优化指南

## 📊 当前模型状态

**文件信息：**
- 文件名：`fish_doodle_classifier.onnx`
- 文件大小：**42.63 MB** (43,651 KB)
- 模型架构：PyTorch训练后导出的ONNX模型
- 输入尺寸：224x224x3 (ImageNet标准)
- 输出：单个二分类 logit值

**性能影响：**
- **快速WiFi (50 Mbps)**：~7秒下载
- **4G网络 (10 Mbps)**：~34秒下载
- **慢速3G (1 Mbps)**：**~5.7分钟下载** ⚠️

## 🎯 优化目标

将模型大小从 **42.63 MB** 减小到 **10-15 MB**，同时保持准确率在可接受范围内（±5%）。

---

## 🔧 优化方案

### 方案 1：INT8 量化（推荐）

**原理：**
将模型权重从 FP32（32位浮点数）量化为 INT8（8位整数），减小约 75% 的模型大小。

**优势：**
- ✅ 大幅减小模型大小（预计 10-12 MB）
- ✅ 推理速度可能提升 2-4倍
- ✅ 准确率损失通常 < 1%
- ✅ 实现相对简单

**实施步骤：**

#### 1. 安装依赖
```bash
pip install onnxruntime onnxruntime-tools torch torchvision
```

#### 2. 量化模型
```python
from onnxruntime.quantization import quantize_dynamic, QuantType
import onnx

# 动态量化（无需校准数据）
model_fp32 = 'fish_doodle_classifier.onnx'
model_quant = 'fish_doodle_classifier_int8.onnx'

quantize_dynamic(
    model_input=model_fp32,
    model_output=model_quant,
    weight_type=QuantType.QUInt8  # 无符号8位整数
)

# 检查模型大小
import os
original_size = os.path.getsize(model_fp32) / (1024 * 1024)
quantized_size = os.path.getsize(model_quant) / (1024 * 1024)
print(f"Original: {original_size:.2f} MB")
print(f"Quantized: {quantized_size:.2f} MB")
print(f"Reduction: {((original_size - quantized_size) / original_size * 100):.1f}%")
```

#### 3. 验证准确率
```python
import onnxruntime as ort
import numpy as np
from PIL import Image
import torchvision.transforms as transforms

# 加载测试数据
def preprocess_image(image_path):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    image = Image.open(image_path).convert('RGB')
    return transform(image).unsqueeze(0).numpy()

# 比较两个模型的输出
session_fp32 = ort.InferenceSession(model_fp32)
session_int8 = ort.InferenceSession(model_quant)

test_images = ['test_fish1.png', 'test_fish2.png', ...]  # 测试集

for img_path in test_images:
    input_data = preprocess_image(img_path)
    
    # FP32 推理
    output_fp32 = session_fp32.run(None, {session_fp32.get_inputs()[0].name: input_data})[0]
    
    # INT8 推理
    output_int8 = session_int8.run(None, {session_int8.get_inputs()[0].name: input_data})[0]
    
    # 比较输出差异
    diff = np.abs(output_fp32 - output_int8)
    print(f"{img_path}: Max diff = {diff.max():.6f}")
```

---

### 方案 2：模型蒸馏 (Model Distillation)

**原理：**
训练一个更小的"学生"模型（如 MobileNetV3-Small）来模仿大模型的行为。

**优势：**
- ✅ 模型可以非常小（5-8 MB）
- ✅ 推理速度最快
- ✅ 更适合移动端

**劣势：**
- ❌ 需要重新训练
- ❌ 实施复杂度高
- ❌ 可能需要更多训练数据

**实施步骤：**

#### 1. 选择轻量级架构
```python
import torch
import torch.nn as nn
import torchvision.models as models

# 使用 MobileNetV3-Small 作为学生模型
student_model = models.mobilenet_v3_small(pretrained=True)
student_model.classifier[3] = nn.Linear(
    student_model.classifier[3].in_features, 
    1  # 二分类输出
)
```

#### 2. 蒸馏训练
```python
import torch.nn.functional as F

def distillation_loss(student_output, teacher_output, labels, temperature=3.0, alpha=0.5):
    """
    结合硬标签和软标签的蒸馏损失
    """
    # 软标签损失（KL散度）
    soft_loss = F.kl_div(
        F.log_softmax(student_output / temperature, dim=1),
        F.softmax(teacher_output / temperature, dim=1),
        reduction='batchmean'
    ) * (temperature ** 2)
    
    # 硬标签损失（BCE）
    hard_loss = F.binary_cross_entropy_with_logits(student_output, labels)
    
    # 加权组合
    return alpha * soft_loss + (1 - alpha) * hard_loss

# 训练循环
teacher_model.eval()  # 教师模型固定
student_model.train()

for epoch in range(num_epochs):
    for images, labels in train_loader:
        # 教师模型推理
        with torch.no_grad():
            teacher_output = teacher_model(images)
        
        # 学生模型推理
        student_output = student_model(images)
        
        # 计算蒸馏损失
        loss = distillation_loss(student_output, teacher_output, labels)
        
        # 反向传播
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
```

#### 3. 导出为 ONNX
```python
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    student_model,
    dummy_input,
    "fish_classifier_mobilenet.onnx",
    export_params=True,
    opset_version=12,
    input_names=['input'],
    output_names=['output']
)
```

---

### 方案 3：ONNX 图优化

**原理：**
使用 ONNX Runtime 的优化工具简化模型图结构，移除冗余操作。

**优势：**
- ✅ 无需重新训练
- ✅ 可与量化结合使用
- ✅ 实施简单

**实施步骤：**

```python
from onnxruntime.transformers.optimizer import optimize_model

# 优化模型图
optimized_model = optimize_model(
    'fish_doodle_classifier.onnx',
    model_type='bert',  # 或其他合适的类型
    num_heads=0,
    hidden_size=0
)

optimized_model.save_model_to_file('fish_classifier_optimized.onnx')
```

或使用 ONNX 优化器：

```python
import onnx
from onnx import optimizer

# 加载模型
model = onnx.load('fish_doodle_classifier.onnx')

# 应用优化passes
passes = [
    'eliminate_deadend',
    'eliminate_identity',
    'eliminate_nop_dropout',
    'eliminate_nop_pad',
    'eliminate_nop_transpose',
    'eliminate_unused_initializer',
    'fuse_bn_into_conv',
    'fuse_consecutive_squeezes',
    'fuse_consecutive_transposes',
    'fuse_transpose_into_gemm',
]

optimized_model = optimizer.optimize(model, passes)
onnx.save(optimized_model, 'fish_classifier_optimized.onnx')
```

---

## 📈 推荐实施路径

### 阶段 1：快速优化（1-2小时）
1. **INT8 量化** - 立即减小75%大小
2. **ONNX 图优化** - 额外减小5-10%
3. **测试验证** - 确保准确率可接受

**预期结果：** 42.63 MB → **10-12 MB**

### 阶段 2：深度优化（1-2周，可选）
1. **模型蒸馏** - 使用 MobileNetV3-Small
2. **重新训练** - 在原始数据集上训练
3. **超参数调优** - 平衡大小和准确率

**预期结果：** 42.63 MB → **5-8 MB**

---

## 🧪 测试清单

优化后必须验证：

- [ ] **准确率测试** - 在测试集上评估
- [ ] **推理速度** - 测量实际推理时间
- [ ] **浏览器兼容性** - 确保 ONNX Runtime Web 支持
- [ ] **文件大小** - 确认压缩比例
- [ ] **用户体验** - 实际网络环境测试

---

## 🔗 相关资源

- [ONNX Runtime Quantization Documentation](https://onnxruntime.ai/docs/performance/quantization.html)
- [Model Distillation Paper (Hinton et al.)](https://arxiv.org/abs/1503.02531)
- [MobileNet V3 Paper](https://arxiv.org/abs/1905.02244)
- [ONNX Optimizer GitHub](https://github.com/onnx/optimizer)

---

## 💡 其他优化建议

### 1. CDN 加速
将模型文件部署到 CDN（如 Cloudflare、AWS CloudFront）可以显著提升下载速度。

### 2. 分块加载
如果模型仍然很大，可以考虑：
- 先加载一个小型"预览"模型（快速反馈）
- 后台加载完整模型（高精度验证）

### 3. 渐进式 Web App (PWA)
配合 Service Worker 缓存，首次加载后永久缓存，用户体验最佳。

---

## 📝 实施记录

| 日期 | 操作 | 结果 | 备注 |
|------|------|------|------|
| 2024-XX-XX | 初始分析 | 42.63 MB | 基准模型 |
| 待实施 | INT8量化 | 预计10-12 MB | - |
| 待实施 | 模型蒸馏 | 预计5-8 MB | 可选 |

---

**最后更新：** 2024-10-31  
**维护者：** FishArt.Online 开发团队

