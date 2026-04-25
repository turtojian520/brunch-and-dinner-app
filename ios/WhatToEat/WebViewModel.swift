import Foundation

final class WebViewModel: ObservableObject {
    let initialURL: URL
    @Published private(set) var isInitialLoad: Bool = true

    init(initialURL: URL) {
        self.initialURL = initialURL
    }

    func markFirstLoadComplete() {
        if isInitialLoad {
            isInitialLoad = false
        }
    }
}
