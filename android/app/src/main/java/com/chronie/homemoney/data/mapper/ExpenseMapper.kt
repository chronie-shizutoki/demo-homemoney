package com.chronie.homemoney.demo.data.mapper

import com.chronie.homemoney.demo.data.local.entity.ExpenseEntity
import com.chronie.homemoney.demo.domain.model.Expense
import com.chronie.homemoney.demo.domain.model.ExpenseType

/**
 * 支出数据映射器
 */
object ExpenseMapper {
    
    /**
     * Entity -> Domain Model
     * 直接使用数据库中的日期字符串
     */
    fun toDomain(entity: ExpenseEntity): Expense {
        return Expense(
            id = entity.id,
            type = ExpenseType.fromString(entity.type),
            remark = entity.remark,
            amount = entity.amount,
            date = entity.date
        )
    }
    
    /**
     * Domain Model -> Entity
     * 日期字符串转换为毫秒时间戳存储
     */
    fun toEntity(expense: Expense): ExpenseEntity {
        // 将日期字符串转换为时间戳（当天0点）
        val date = java.time.LocalDate.parse(expense.date)
        val timeInMillis = date.atStartOfDay().toEpochSecond(java.time.ZoneOffset.UTC) * 1000
        return ExpenseEntity(
            id = expense.id,
            type = getChineseTypeName(expense.type),
            remark = expense.remark,
            amount = expense.amount,
            date = expense.date
        )
    }
    
    /**
     * 获取支出类型的中文名称
     */
    private fun getChineseTypeName(type: ExpenseType): String {
        return when (type) {
            ExpenseType.DAILY_GOODS -> "日常用品"
            ExpenseType.LUXURY -> "奢侈品"
            ExpenseType.COMMUNICATION -> "通讯费用"
            ExpenseType.FOOD -> "食品"
            ExpenseType.SNACKS -> "零食糖果"
            ExpenseType.COLD_DRINKS -> "冷饮"
            ExpenseType.CONVENIENCE_FOOD -> "方便食品"
            ExpenseType.TEXTILES -> "纺织品"
            ExpenseType.BEVERAGES -> "饮品"
            ExpenseType.CONDIMENTS -> "调味品"
            ExpenseType.TRANSPORTATION -> "交通出行"
            ExpenseType.DINING -> "餐饮"
            ExpenseType.MEDICAL -> "医疗费用"
            ExpenseType.FRUITS -> "水果"
            ExpenseType.OTHER -> "其他"
            ExpenseType.SEAFOOD -> "水产品"
            ExpenseType.DAIRY -> "乳制品"
            ExpenseType.GIFTS -> "礼物人情"
            ExpenseType.TRAVEL -> "旅行度假"
            ExpenseType.GOVERNMENT -> "政务"
            ExpenseType.UTILITIES -> "水电煤气"
        }
    }
}
