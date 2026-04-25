import Foundation

/// Configuration for the WebView shell.
///
/// Change `webAppURL` to point to your deployed web app. To override at build
/// time without editing source, set the `WEB_APP_URL` user-defined build
/// setting (or pass `WEB_APP_URL=...` via xcodebuild) and read it via
/// Info.plist key `WEB_APP_URL`.
enum AppConfig {
    static let webAppURL: URL = {
        if let plistValue = Bundle.main.object(forInfoDictionaryKey: "WEB_APP_URL") as? String,
           !plistValue.isEmpty,
           let url = URL(string: plistValue) {
            return url
        }
        return URL(string: "https://whatoeat.vercel.app")!
    }()
}
