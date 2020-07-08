const loading = document.getElementById('loading');

export function hideLoadingSpinner() {
  loading.style.display = 'none';
}

export function showLoadingSpinner() {
  loading.style.display = 'flex';
}
