package com.chronie.homemoney

import android.content.Context
import android.content.res.Configuration
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.view.WindowCompat
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.chronie.homemoney.R
import com.chronie.homemoney.core.common.LanguageManager
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import com.chronie.homemoney.ui.expense.AddExpenseScreen
import com.chronie.homemoney.ui.main.MainScreen
import com.chronie.homemoney.ui.settings.SettingsScreen
import com.chronie.homemoney.ui.test.DatabaseTestScreen
import com.chronie.homemoney.ui.theme.HomeMoneyTheme
import com.chronie.homemoney.ui.Watermark
import dagger.hilt.android.AndroidEntryPoint
import java.util.Locale
import javax.inject.Inject

val LocalLanguageManager = staticCompositionLocalOf<LanguageManager> {
    error("No LanguageManager provided")
}

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    @Inject
    lateinit var languageManager: LanguageManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 立即切换到正常主题，避免启动图背景影响 Popup 窗口
        setTheme(R.style.AppTheme_NoActionBar)
        
        // 清除启动图背景，设置为透明背景
        window.setBackgroundDrawableResource(android.R.color.transparent)
        
        // Enable edge-to-edge display
        enableEdgeToEdge()
        
        // Make sure the window draws behind system bars
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        setContent {
            val currentLanguage by languageManager.currentLanguage.collectAsState()
            
            // Update configuration when language changes
            val context = LocalContext.current
            val locale = currentLanguage.locale
            Locale.setDefault(locale)
            val configuration = Configuration(context.resources.configuration)
            configuration.setLocale(locale)
            val localizedContext = context.createConfigurationContext(configuration)
            
            CompositionLocalProvider(
                LocalLanguageManager provides languageManager
            ) {
                HomeMoneyTheme {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        HomeMoneyApp(
                        context = localizedContext
                    )
                    }
                }
            }
        }
    }
    
    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(newBase)
    }
    
    override fun onDestroy() {
        super.onDestroy()
    }
}

@Composable
fun HomeMoneyApp(
    context: Context
) {
    val navController = rememberNavController()
    var shouldRefreshExpenses by remember { mutableStateOf(false) }
    
    // 确定初始路由 - 始终从main开始
    val startDestination = "main"

    // 使用Box布局叠加NavHost和水印组件
    Box(modifier = Modifier.fillMaxSize()) {
        NavHost(
            navController = navController,
            startDestination = startDestination
        ) {
            composable("settings") {
                SettingsScreen(
                    context = context,
                    onNavigateToDatabaseTest = {
                        navController.navigate("database_test")
                    }
                )
            }
            
            composable("main") {
                MainScreen(
                    context = context,
                    shouldRefreshExpenses = shouldRefreshExpenses,
                    onRefreshHandled = { shouldRefreshExpenses = false },
                    onNavigateToSettings = {
                        navController.navigate("settings")
                    },
                    onNavigateToDatabaseTest = {
                        navController.navigate("database_test")
                    },
                    onNavigateToAddExpense = {
                        navController.navigate("add_expense")
                    },
                    onNavigateToEditExpense = { expenseId ->
                        navController.navigate(
                            route = "add_expense?expenseId=$expenseId"
                        )
                    }
                )
            }
            
            composable(
                "add_expense?expenseId={expenseId}",
                arguments = listOf(
                    navArgument("expenseId") {
                        type = NavType.StringType
                        nullable = true
                        defaultValue = null
                    }
                )
            ) { backStackEntry ->
                val expenseId = backStackEntry.arguments?.getString("expenseId")
                AddExpenseScreen(
                    context = context,
                    expenseId = expenseId,
                    onNavigateBack = {
                        shouldRefreshExpenses = true
                        navController.popBackStack()
                    }
                )
            }

            composable("database_test") {
                DatabaseTestScreen(
                    context = context,
                    onNavigateBack = {
                        navController.popBackStack()
                    }
                )
            }
        }
        
        // 添加水印组件
        Watermark(locale = context.resources.configuration.locale)
    }
}
