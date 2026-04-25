import SwiftUI

struct RootView: View {
    @StateObject private var model = WebViewModel(initialURL: AppConfig.webAppURL)

    var body: some View {
        ZStack {
            Color(.systemBackground)
                .ignoresSafeArea()

            WebViewContainer(model: model)
                .ignoresSafeArea(edges: .bottom)

            if model.isInitialLoad {
                ProgressView()
                    .controlSize(.large)
            }
        }
    }
}

#Preview {
    RootView()
}
