package com.chronie.homemoney.demo

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class HomeMoneyApplication : Application() {

    override fun onCreate() {
        super.onCreate()
    }
}
