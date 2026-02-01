package com.chronie.homemoney.demo.ui.settings

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chronie.homemoney.demo.R
import com.chronie.homemoney.demo.core.common.Language
import com.chronie.homemoney.demo.core.common.LanguageManager
import com.chronie.homemoney.demo.domain.usecase.ExportExpensesUseCase
import com.chronie.homemoney.demo.domain.usecase.ImportExpensesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val languageManager: LanguageManager,
    private val exportExpensesUseCase: ExportExpensesUseCase,
    private val importExpensesUseCase: ImportExpensesUseCase,
    @dagger.hilt.android.qualifiers.ApplicationContext private val context: android.content.Context
) : ViewModel() {

    val currentLanguage: StateFlow<Language> = languageManager.currentLanguage
    
    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()
    
    private val _exportInProgress = MutableStateFlow(false)
    val exportInProgress: StateFlow<Boolean> = _exportInProgress.asStateFlow()
    
    private val _importInProgress = MutableStateFlow(false)
    val importInProgress: StateFlow<Boolean> = _importInProgress.asStateFlow()

    fun setLanguage(language: Language) {
        languageManager.setLanguage(language)
    }
    
    fun clearMessage() {
        _message.value = null
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
