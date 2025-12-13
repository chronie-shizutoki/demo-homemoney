package com.chronie.homemoney.ui.settings

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chronie.homemoney.demo.R
import com.chronie.homemoney.core.common.DeveloperMode
import com.chronie.homemoney.core.common.Language
import com.chronie.homemoney.core.common.LanguageManager
import com.chronie.homemoney.domain.usecase.ExportExpensesUseCase
import com.chronie.homemoney.domain.usecase.ImportExpensesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val languageManager: LanguageManager,
    private val developerMode: DeveloperMode,
    private val exportExpensesUseCase: ExportExpensesUseCase,
    private val importExpensesUseCase: ImportExpensesUseCase,
    @dagger.hilt.android.qualifiers.ApplicationContext private val context: android.content.Context
) : ViewModel() {

    // 动态颜色开关状态
    private val _useDynamicColor = MutableStateFlow(true)
    val useDynamicColor: StateFlow<Boolean> = _useDynamicColor.asStateFlow()

    // 手动选择的主色调
    private val _primaryColor = MutableStateFlow(0xFF6750A4.toInt()) // 默认紫色
    val primaryColor: StateFlow<Int> = _primaryColor.asStateFlow()

    val currentLanguage: StateFlow<Language> = languageManager.currentLanguage
    
    val isDeveloperMode: Flow<Boolean> = developerMode.isDeveloperModeEnabled
    
    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()
    
    private val _exportInProgress = MutableStateFlow(false)
    val exportInProgress: StateFlow<Boolean> = _exportInProgress.asStateFlow()
    
    private val _importInProgress = MutableStateFlow(false)
    val importInProgress: StateFlow<Boolean> = _importInProgress.asStateFlow()

    init {
        loadDynamicColorSettings()
    }

    fun setLanguage(language: Language) {
        languageManager.setLanguage(language)
    }
    
    fun toggleDeveloperMode() {
        viewModelScope.launch {
            developerMode.toggleDeveloperMode()
        }
    }
    
    fun clearMessage() {
        _message.value = null
    }

    // 加载动态颜色设置
    private fun loadDynamicColorSettings() {
        viewModelScope.launch {
            val prefs = context.getSharedPreferences("theme_settings", android.content.Context.MODE_PRIVATE)
            _useDynamicColor.value = prefs.getBoolean("use_dynamic_color", true)
            _primaryColor.value = prefs.getInt("primary_color", 0xFF6750A4.toInt())
        }
    }

    // 切换动态颜色开关
    fun toggleDynamicColor(enabled: Boolean) {
        viewModelScope.launch {
            val prefs = context.getSharedPreferences("theme_settings", android.content.Context.MODE_PRIVATE)
            prefs.edit().putBoolean("use_dynamic_color", enabled).apply()
            _useDynamicColor.value = enabled
            _message.value = context.getString(if (enabled) R.string.dynamic_color_enabled else R.string.dynamic_color_disabled)
        }
    }

    // 设置手动颜色
    fun setPrimaryColor(color: Int) {
        viewModelScope.launch {
            val prefs = context.getSharedPreferences("theme_settings", android.content.Context.MODE_PRIVATE)
            prefs.edit().putInt("primary_color", color).apply()
            _primaryColor.value = color
            _message.value = context.getString(R.string.primary_color_updated)
        }
    }
    
    fun exportExpenses(startDate: LocalDate? = null, endDate: LocalDate? = null) {
        viewModelScope.launch {
            try {
                _exportInProgress.value = true
                _message.value = context.getString(R.string.export_in_progress)
                
                val result = exportExpensesUseCase(startDate, endDate)
                
                if (result.isSuccess) {
                    val filePath = result.getOrNull()
                    _message.value = context.getString(R.string.export_success, filePath)
                } else {
                    _message.value = context.getString(
                        R.string.export_failed,
                        result.exceptionOrNull()?.message ?: "Unknown error"
                    )
                }
            } catch (e: Exception) {
                _message.value = context.getString(R.string.export_failed, e.message)
            } finally {
                _exportInProgress.value = false
            }
        }
    }
    
    fun importExpenses(uri: Uri) {
        viewModelScope.launch {
            try {
                _importInProgress.value = true
                _message.value = context.getString(R.string.import_in_progress)
                
                val result = importExpensesUseCase(uri)
                
                if (result.isSuccess) {
                    val importResult = result.getOrNull()!!
                    _message.value = context.getString(
                        R.string.import_success,
                        importResult.successCount
                    )
                    
                    // 如果有失败的记录，显示错误信息
                    if (importResult.failedCount > 0) {
                        android.util.Log.w("ImportExpenses", "Failed to import ${importResult.failedCount} records")
                        importResult.errors.forEach { error ->
                            android.util.Log.w("ImportExpenses", error)
                        }
                    }
                } else {
                    _message.value = context.getString(
                        R.string.import_failed,
                        result.exceptionOrNull()?.message ?: "Unknown error"
                    )
                }
            } catch (e: Exception) {
                _message.value = context.getString(R.string.import_failed, e.message)
            } finally {
                _importInProgress.value = false
            }
        }
    }
}
