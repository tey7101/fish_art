#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ONNX 模型 INT8 量化脚本
将 fish_doodle_classifier.onnx (42.63 MB) 量化为 INT8 格式
预期减小约 75% 的大小
"""

import os
import sys
import io

# 设置标准输出编码为 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    from onnxruntime.quantization import quantize_dynamic, QuantType
    import onnx
except ImportError:
    print("❌ 缺少依赖库！")
    print("\n请先安装依赖：")
    print("pip install onnxruntime onnx")
    sys.exit(1)

def quantize_model(input_model, output_model):
    """
    使用动态量化将模型从 FP32 转换为 INT8
    """
    print("🔧 开始量化模型...")
    print(f"📁 输入模型: {input_model}")
    
    # 检查输入文件是否存在
    if not os.path.exists(input_model):
        print(f"❌ 错误: 找不到模型文件 {input_model}")
        sys.exit(1)
    
    # 获取原始模型大小
    original_size = os.path.getsize(input_model) / (1024 * 1024)
    print(f"📊 原始模型大小: {original_size:.2f} MB")
    
    # 执行动态量化
    print("\n⚙️  正在执行 INT8 量化（这可能需要几分钟）...")
    try:
        quantize_dynamic(
            model_input=input_model,
            model_output=output_model,
            weight_type=QuantType.QUInt8,  # 无符号 8 位整数
            optimize_model=True  # 同时进行图优化
        )
        print("✅ 量化完成！")
    except Exception as e:
        print(f"❌ 量化失败: {str(e)}")
        sys.exit(1)
    
    # 获取量化后模型大小
    quantized_size = os.path.getsize(output_model) / (1024 * 1024)
    reduction = ((original_size - quantized_size) / original_size * 100)
    
    print(f"\n📊 量化结果:")
    print(f"   原始大小:  {original_size:.2f} MB")
    print(f"   量化大小:  {quantized_size:.2f} MB")
    print(f"   减小比例:  {reduction:.1f}%")
    print(f"   节省空间:  {original_size - quantized_size:.2f} MB")
    
    # 验证模型文件
    print("\n🔍 验证量化后的模型...")
    try:
        model = onnx.load(output_model)
        onnx.checker.check_model(model)
        print("✅ 模型验证通过！")
    except Exception as e:
        print(f"❌ 模型验证失败: {str(e)}")
        sys.exit(1)
    
    print(f"\n🎉 成功！量化模型已保存到: {output_model}")
    
    # 网络性能估算
    print("\n📡 网络加载时间估算:")
    print(f"   快速 WiFi (50 Mbps):  ~{quantized_size * 8 / 50:.1f} 秒")
    print(f"   4G 网络 (10 Mbps):     ~{quantized_size * 8 / 10:.1f} 秒")
    print(f"   慢速 3G (1 Mbps):      ~{quantized_size * 8 / 1 / 60:.1f} 分钟")

if __name__ == "__main__":
    # 输入输出文件名
    input_model = "fish_doodle_classifier.onnx"
    output_model = "fish_doodle_classifier_int8.onnx"
    
    print("=" * 60)
    print("🐟 Fish Doodle Classifier - ONNX 模型量化工具")
    print("=" * 60)
    
    quantize_model(input_model, output_model)
    
    print("\n" + "=" * 60)
    print("✨ 完成！您可以使用量化后的模型替换原模型。")
    print("=" * 60)

