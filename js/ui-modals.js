// Custom Modal and Notification System

// Show custom notification (replaces alert)
function showNotification(message, type = 'info') {
  // Remove any existing notification
  const existing = document.querySelector('.custom-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `custom-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">${getNotificationIcon(type)}</div>
      <div class="notification-message">${message}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
  
  // Tap to dismiss
  notification.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  });
}

// Get icon based on notification type
function getNotificationIcon(type) {
  switch(type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return 'ℹ️';
  }
}

// Show custom confirm modal (replaces confirm)
function showConfirmModal(title, message, onConfirm, onCancel = null) {
  // Remove any existing modal
  const existing = document.querySelector('.custom-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-footer">
        <button class="modal-btn cancel-btn">Cancel</button>
        <button class="modal-btn confirm-btn">Confirm</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Animate in
  setTimeout(() => modal.classList.add('show'), 10);
  
  // Handle cancel
  const cancelBtn = modal.querySelector('.cancel-btn');
  const backdrop = modal.querySelector('.modal-backdrop');
  
  const handleCancel = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
    if (onCancel) onCancel();
  };
  
  cancelBtn.addEventListener('click', handleCancel);
  backdrop.addEventListener('click', handleCancel);
  
  // Handle confirm
  const confirmBtn = modal.querySelector('.confirm-btn');
  confirmBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
    if (onConfirm) onConfirm();
  });
}

// Show custom prompt modal (for future use)
function showPromptModal(title, message, defaultValue = '', onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
      </div>
      <div class="modal-body">
        <p>${message}</p>
        <input type="text" class="modal-input" value="${defaultValue}" placeholder="Enter value...">
      </div>
      <div class="modal-footer">
        <button class="modal-btn cancel-btn">Cancel</button>
        <button class="modal-btn confirm-btn">Confirm</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setTimeout(() => modal.classList.add('show'), 10);
  
  const input = modal.querySelector('.modal-input');
  input.focus();
  
  const handleCancel = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  };
  
  modal.querySelector('.cancel-btn').addEventListener('click', handleCancel);
  modal.querySelector('.modal-backdrop').addEventListener('click', handleCancel);
  
  const handleConfirm = () => {
    const value = input.value;
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
    if (onConfirm) onConfirm(value);
  };
  
  modal.querySelector('.confirm-btn').addEventListener('click', handleConfirm);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleConfirm();
  });
}
