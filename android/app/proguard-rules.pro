# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Keep line numbers for debugging
-keepattributes SourceFile,LineNumberTable

# Keep generic signatures
-keepattributes Signature

# Keep annotations
-keepattributes *Annotation*

# Kotlin
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}

# Hilt
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-keep class * extends dagger.hilt.android.internal.managers.ViewComponentManager$FragmentContextWrapper
-keep class * extends dagger.hilt.android.internal.managers.ViewComponentManager$ActivityContextWrapper
-dontwarn dagger.hilt.**

# Room
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**

# Compose
-keep class androidx.compose.** { *; }
-keep class androidx.compose.ui.** { *; }
-dontwarn androidx.compose.**

# Apache POI
-keep class org.apache.poi.** { *; }
-dontwarn org.apache.poi.**

# SQLCipher
-keep class net.sqlcipher.** { *; }
-dontwarn net.sqlcipher.**

# WorkManager
-keep class androidx.work.** { *; }
-dontwarn androidx.work.**

# DataStore
-keep class androidx.datastore.** { *; }
-dontwarn androidx.datastore.**

# Keep model classes
-keep class com.chronie.homemoney.demo.domain.model.** { *; }

# Keep ViewModels
-keepclassmembers class * extends androidx.lifecycle.ViewModel {
    <init>();
}

# Keep all public methods in ViewModels
-keepclassmembers class * extends androidx.lifecycle.ViewModel {
    public <methods>;
}

# Keep Hilt generated classes
-keep class * extends dagger.hilt.android.internal.managers.ViewComponentManager$FragmentContextWrapper
-keep class * extends dagger.hilt.android.internal.managers.ViewComponentManager$ActivityContextWrapper
-keep class * extends androidx.hilt.work.HiltWorker

# Keep Hilt generated classes
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-keep class * extends dagger.hilt.android.internal.managers.ViewComponentManager$FragmentContextWrapper
-keep class * extends dagger.hilt.android.internal.managers.ViewComponentManager$ActivityContextWrapper
-dontwarn dagger.hilt.**

# Keep Room entities and DAOs
-keep @androidx.room.Entity class *
-keep @androidx.room.Dao class *
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.**

# Keep Compose UI
-keepclassmembers class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# Keep Apache POI
-keep class org.apache.poi.** { *; }
-dontwarn org.apache.poi.**

# Keep SQLCipher
-keep class net.sqlcipher.** { *; }
-dontwarn net.sqlcipher.**

# Keep WorkManager
-keep class androidx.work.** { *; }
-dontwarn androidx.work.**

# Keep DataStore
-keep class androidx.datastore.** { *; }
-dontwarn androidx.datastore.**

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Parcelable classes
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Keep R8 full mode rules
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep reflection
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep Gson
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Keep kotlinx.coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** {
    <fields>;
}

# Keep application class
-keep public class * extends android.app.Application
