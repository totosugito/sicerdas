package fahim_edu.bse

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.io.FileOutputStream

class MainActivity : FlutterActivity() {
    private val CHANNEL = "fahim_edu.bse/pdf_open"
    private var methodChannel: MethodChannel? = null
    private var pendingPdfPath: String? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        methodChannel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
        methodChannel?.setMethodCallHandler { call, result ->
            if (call.method == "getPendingPdfPath") {
                result.success(pendingPdfPath)
                pendingPdfPath = null
            } else {
                result.notImplemented()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        if (intent != null && intent.action == Intent.ACTION_VIEW) {
            val uri: Uri? = intent.data
            if (uri != null && intent.type == "application/pdf") {
                val cachedPath = cachePdfFromUri(uri)
                if (cachedPath != null) {
                    pendingPdfPath = cachedPath
                    methodChannel?.invokeMethod("onPdfOpened", cachedPath)
                }
            }
        }
    }

    private fun cachePdfFromUri(uri: Uri): String? {
        try {
            val contentResolver = applicationContext.contentResolver
            val inputStream = contentResolver.openInputStream(uri) ?: return null
            val cacheDir = applicationContext.cacheDirs().firstOrNull() ?: applicationContext.cacheDir
            val tempFile = File(cacheDir, "shared_temp_viewer.pdf")
            
            FileOutputStream(tempFile).use { outputStream ->
                inputStream.copyTo(outputStream)
            }
            return tempFile.absolutePath
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    private fun android.content.Context.cacheDirs(): Array<File> {
        return externalCacheDirs.filterNotNull().toTypedArray()
    }
}

