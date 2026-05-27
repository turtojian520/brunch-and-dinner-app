/**
 * Responsive browser-based alert utility
 */
export const showAlert = (title, message) => {
  // Dispatch a custom event so the global layout can show a premium modal alert
  const event = new CustomEvent('custom-alert', {
    detail: { title, message }
  });
  window.dispatchEvent(event);
  
  // Fallback for extreme cases
  if (!window.__hasAlertHandler) {
    alert(`${title}\n\n${message}`);
  }
};

export default showAlert;
