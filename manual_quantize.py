# -*- coding: utf-8 -*-
"""
手动量化ONNX模型
通过转换权重精度来减小模型大小
"""

import os
import sys
import io

# 设置标准输出编码为 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    import onnx
    from onnx import numpy_helper
    import numpy as np
except ImportError as e:
    print(f"错误: 缺少依赖库 - {e}")
    print("\n请先安装依赖：")
    print("pip install onnx numpy")
    sys.exit(1)

def quantize_weights_float16(input_model_path, output_model_path):
    """
    将模型权重从 float32 转换为 float16
    可以减小约 50% 的模型大小
    """
    print("=" * 60)
    print("🐟 Fish Doodle Classifier - Float16 权重量化工具")
    print("=" * 60)
    print(f"\n📁 输入模型: {input_model_path}")
    
    # 检查输入文件
    if not os.path.exists(input_model_path):
        print(f"❌ 错误: 找不到模型文件 {input_model_path}")
        sys.exit(1)
    
    # 获取原始模型大小
    original_size = os.path.getsize(input_model_path) / (1024 * 1024)
    print(f"📊 原始模型大小: {original_size:.2f} MB")
    
    # 加载模型
    print("\n⚙️  正在加载模型...")
    try:
        model = onnx.load(input_model_path)
        print("✅ 模型加载成功！")
    except Exception as e:
        print(f"❌ 加载模型失败: {str(e)}")
        sys.exit(1)
    
    # 转换权重为 float16
    print("\n⚙️  正在将权重从 float32 转换为 float16...")
    converted_count = 0
    
    for tensor in model.graph.initializer:
        if tensor.data_type == onnx.TensorProto.FLOAT:
            # 获取原始权重数据
            float32_data = numpy_helper.to_array(tensor)
            
            # 转换为 float16
            float16_data = float32_data.astype(np.float16)
            
            # 更新 tensor
            tensor.ClearField('float_data')
            tensor.ClearField('raw_data')
            tensor.data_type = onnx.TensorProto.FLOAT16
            tensor.raw_data = float16_data.tobytes()
            
            converted_count += 1
    
    print(f"✅ 已转换 {converted_count} 个权重张量")
    
    # 保存模型
    print(f"\n💾 正在保存量化模型到: {output_model_path}")
    try:
        onnx.save(model, output_model_path)
        print("✅ 模型保存成功！")
    except Exception as e:
        print(f"❌ 保存模型失败: {str(e)}")
        sys.exit(1)
    
    # 获取量化后模型大小
    quantized_size = os.path.getsize(output_model_path) / (1024 * 1024)
    reduction = ((original_size - quantized_size) / original_size * 100)
    
    print(f"\n📊 量化结果:")
    print(f"   原始大小:  {original_size:.2f} MB")
    print(f"   量化大小:  {quantized_size:.2f} MB")
    print(f"   减小比例:  {reduction:.1f}%")
    print(f"   节省空间:  {original_size - quantized_size:.2f} MB")
    
    # 验证模型
    print("\n🔍 验证量化后的模型...")
    try:
        test_model = onnx.load(output_model_path)
        onnx.checker.check_model(test_model)
        print("✅ 模型验证通过！")
    except Exception as e:
        print(f"❌ 模型验证失败: {str(e)}")
        sys.exit(1)
    
    # 网络性能估算
    print("\n📡 网络加载时间估算:")
    print(f"   快速 WiFi (50 Mbps):  ~{quantized_size * 8 / 50:.1f} 秒")
    print(f"   4G 网络 (10 Mbps):     ~{quantized_size * 8 / 10:.1f} 秒")
    print(f"   慢速 3G (1 Mbps):      ~{quantized_size * 8 / 1 / 60:.1f} 分钟")
    
    print("\n" + "=" * 60)
    print("✨ 完成！")
    print("=" * 60)
    
    print("\n💡 说明:")
    print("   - Float16 量化通常可减小 50% 大小")
    print("   - 精度损失极小（< 0.1%）")
    print("   - 广泛支持，兼容性好")
    print("   - 如需更小的模型，考虑 INT8 量化（需要 onnxruntime）")

if __name__ == "__main__":
    input_model = "fish_doodle_classifier.onnx"
    output_model = "fish_doodle_classifier_float16.onnx"
    
    quantize_weights_float16(input_model, output_model)


