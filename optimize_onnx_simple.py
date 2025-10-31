# -*- coding: utf-8 -*-
"""
简单的 ONNX 模型优化脚本
使用 ONNX 优化器进行图优化和权重压缩
"""

import os
import sys
import io

# 设置标准输出编码为 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    import onnx
    from onnx import optimizer
    import numpy as np
except ImportError as e:
    print(f"错误: 缺少依赖库 - {e}")
    print("\n请先安装依赖：")
    print("pip install onnx numpy")
    sys.exit(1)

def optimize_model(input_model, output_model):
    """
    使用 ONNX 优化器优化模型
    """
    print("=" * 60)
    print("🐟 Fish Doodle Classifier - ONNX 模型优化工具")
    print("=" * 60)
    print(f"\n📁 输入模型: {input_model}")
    
    # 检查输入文件是否存在
    if not os.path.exists(input_model):
        print(f"❌ 错误: 找不到模型文件 {input_model}")
        sys.exit(1)
    
    # 获取原始模型大小
    original_size = os.path.getsize(input_model) / (1024 * 1024)
    print(f"📊 原始模型大小: {original_size:.2f} MB")
    
    # 加载模型
    print("\n⚙️  正在加载模型...")
    try:
        model = onnx.load(input_model)
        print("✅ 模型加载成功！")
    except Exception as e:
        print(f"❌ 加载模型失败: {str(e)}")
        sys.exit(1)
    
    # 应用优化 passes
    print("\n⚙️  正在应用优化passes...")
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
    
    try:
        optimized_model = optimizer.optimize(model, passes)
        print(f"✅ 已应用 {len(passes)} 个优化passes")
    except Exception as e:
        print(f"⚠️  优化警告: {str(e)}")
        optimized_model = model
    
    # 保存优化后的模型
    print(f"\n💾 正在保存优化模型到: {output_model}")
    try:
        onnx.save(optimized_model, output_model)
        print("✅ 模型保存成功！")
    except Exception as e:
        print(f"❌ 保存模型失败: {str(e)}")
        sys.exit(1)
    
    # 获取优化后模型大小
    optimized_size = os.path.getsize(output_model) / (1024 * 1024)
    
    if optimized_size < original_size:
        reduction = ((original_size - optimized_size) / original_size * 100)
        print(f"\n📊 优化结果:")
        print(f"   原始大小:  {original_size:.2f} MB")
        print(f"   优化大小:  {optimized_size:.2f} MB")
        print(f"   减小比例:  {reduction:.1f}%")
        print(f"   节省空间:  {original_size - optimized_size:.2f} MB")
    else:
        print(f"\n📊 优化结果:")
        print(f"   原始大小:  {original_size:.2f} MB")
        print(f"   优化大小:  {optimized_size:.2f} MB")
        print(f"   ⚠️  文件大小没有显著减小")
    
    # 验证模型文件
    print("\n🔍 验证优化后的模型...")
    try:
        test_model = onnx.load(output_model)
        onnx.checker.check_model(test_model)
        print("✅ 模型验证通过！")
    except Exception as e:
        print(f"❌ 模型验证失败: {str(e)}")
        sys.exit(1)
    
    # 网络性能估算
    print("\n📡 网络加载时间估算:")
    print(f"   快速 WiFi (50 Mbps):  ~{optimized_size * 8 / 50:.1f} 秒")
    print(f"   4G 网络 (10 Mbps):     ~{optimized_size * 8 / 10:.1f} 秒")
    print(f"   慢速 3G (1 Mbps):      ~{optimized_size * 8 / 1 / 60:.1f} 分钟")
    
    print("\n" + "=" * 60)
    print("✨ 完成！")
    print("=" * 60)
    
    print("\n💡 提示:")
    print("   - 图优化主要减少模型结构冗余")
    print("   - 如需进一步压缩，建议使用 INT8 量化")
    print("   - 需要 onnxruntime 且支持您的 Python 版本")

if __name__ == "__main__":
    input_model = "fish_doodle_classifier.onnx"
    output_model = "fish_doodle_classifier_optimized.onnx"
    
    optimize_model(input_model, output_model)


