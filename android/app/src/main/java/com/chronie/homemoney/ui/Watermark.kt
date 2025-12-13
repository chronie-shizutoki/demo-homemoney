package com.chronie.homemoney.demo.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import java.util.Locale

// 水印组件
@Composable
fun Watermark(
    modifier: Modifier = Modifier,
    locale: Locale = Locale.getDefault()
) {
    // 根据当前语言选择水印文本
    val watermarkText = if (locale.language == "zh") {
        "演示版本 Demo Version"
    } else {
        "Demo Version 演示版本"
    }
    
    // 水印数量
    val watermarkCount = 36
    // 列数
    val colCount = 12
    
    // 获取当前屏幕配置
    val configuration = LocalConfiguration.current
    val density = LocalDensity.current
    
    // 根据屏幕宽度确定字体大小 (响应式)
    val fontSize = when {
        configuration.screenWidthDp < 480 -> 12.sp // 小屏幕
        configuration.screenWidthDp < 768 -> 14.sp // 中等屏幕
        else -> 18.sp // 大屏幕
    }
    
    // 根据屏幕宽度确定透明度
    val alpha = when {
        configuration.screenWidthDp < 480 -> 0.15f // 小屏幕透明度适中
        else -> 0.4f // 大屏幕透明度正常
    }
    
    Box(
        modifier = modifier
            .fillMaxSize()
            .zIndex(9999f) // 确保水印在最上层
    ) {
        // 创建网格布局的水印
        for (index in 0 until watermarkCount) {
            val rowIndex = index / colCount
            val colIndex = index % colCount
            
            // 计算每个水印的位置 (百分比)
            val xPercent = colIndex * 25f + (0..3).random().toFloat() // 25% 间距 + 小范围随机偏移
            val yPercent = rowIndex * 33f + (0..3).random().toFloat() // 33% 间距 + 小范围随机偏移
            
            // 将百分比转换为Dp偏移
            val xOffsetDp = with(density) { ((xPercent / 100f) * configuration.screenWidthDp).dp }
            val yOffsetDp = with(density) { ((yPercent / 100f) * configuration.screenHeightDp).dp }
            
            // 水印文本组件
            Text(
                text = watermarkText,
                modifier = Modifier
                    .offset(x = xOffsetDp, y = yOffsetDp)
                    .rotate(-25f) // 固定左倾斜25度
                    .zIndex(9999f),
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = alpha), // 使用主题颜色，自动适应深色/浅色模式
                fontSize = fontSize,
                fontWeight = FontWeight.Normal
            )
        }
    }
}

