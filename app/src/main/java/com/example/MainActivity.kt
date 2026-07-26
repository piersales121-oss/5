package com.example

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material.icons.filled.Sparkles
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        EduZoonAndroidApp()
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun EduZoonAndroidApp() {
  var showWebView by remember { mutableStateOf(true) }
  var webViewRef by remember { mutableStateOf<WebView?>(null) }
  val webAppUrl = "https://ais-pre-as6hqbppsn3euv47y3h2cy-238721698927.asia-southeast1.run.app?android=true"

  Scaffold(
    topBar = {
      TopAppBar(
        colors = TopAppBarDefaults.topAppBarColors(
          containerColor = Color(0xFF0F172A),
          titleContentColor = Color.White
        ),
        title = {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Box(
              modifier = Modifier
                .size(32.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFF059669)),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Default.Smartphone,
                contentDescription = "Android App",
                tint = Color.White,
                modifier = Modifier.size(18.dp)
              )
            }
            Column {
              Text(
                text = "EduZoon",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
              )
              Text(
                text = "Hello Android Mode",
                fontSize = 10.sp,
                color = Color(0xFF34D399)
              )
            }
          }
        },
        actions = {
          IconButton(onClick = { webViewRef?.reload() }) {
            Icon(
              imageVector = Icons.Default.Refresh,
              contentDescription = "Reload App",
              tint = Color(0xFF94A3B8)
            )
          }
        }
      )
    },
    containerColor = Color(0xFF020617)
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(Color(0xFF020617))
    ) {
      if (showWebView) {
        AndroidView(
          modifier = Modifier.fillMaxSize(),
          factory = { context ->
            WebView(context).apply {
              settings.javaScriptEnabled = true
              settings.domStorageEnabled = true
              settings.databaseEnabled = true
              settings.loadWithOverviewMode = true
              settings.useWideViewPort = true
              settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
              webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                  super.onPageFinished(view, url)
                }
              }
              loadUrl(webAppUrl)
              webViewRef = this
            }
          },
          update = { webView ->
            webViewRef = webView
          }
        )
      } else {
        NativeHelloAndroidCard(
          onLaunchWeb = { showWebView = true }
        )
      }
    }
  }
}

@Composable
fun NativeHelloAndroidCard(onLaunchWeb: () -> Unit) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(24.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center
  ) {
    Box(
      modifier = Modifier
        .size(96.dp)
        .clip(RoundedCornerShape(24.dp))
        .background(Color(0xFF059669)),
      contentAlignment = Alignment.Center
    ) {
      Icon(
        imageVector = Icons.Default.Sparkles,
        contentDescription = "Sparkles",
        tint = Color.White,
        modifier = Modifier.size(48.dp)
      )
    }

    Spacer(modifier = Modifier.height(24.dp))

    Text(
      text = "Hello Android!",
      fontSize = 32.sp,
      fontWeight = FontWeight.ExtraBold,
      color = Color.White,
      textAlign = TextAlign.Center
    )

    Spacer(modifier = Modifier.height(8.dp))

    Text(
      text = "EduZoon AI Learning Assistant Android App",
      fontSize = 14.sp,
      color = Color(0xFF94A3B8),
      textAlign = TextAlign.Center
    )

    Spacer(modifier = Modifier.height(32.dp))

    Button(
      onClick = onLaunchWeb,
      colors = ButtonDefaults.buttonColors(
        containerColor = Color(0xFF2563EB),
        contentColor = Color.White
      ),
      shape = RoundedCornerShape(12.dp),
      modifier = Modifier
        .fillMaxWidth()
        .height(50.dp)
    ) {
      Text(
        text = "Open EduZoon App",
        fontWeight = FontWeight.Bold,
        fontSize = 15.sp
      )
    }
  }
}
