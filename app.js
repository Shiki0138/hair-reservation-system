document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.menu-checkbox');
    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    const dateEl = document.getElementById('date');
    const startTimeEl = document.getElementById('start-time');
    const endTimeEl = document.getElementById('end-time');
    const qrcodeContainer = document.getElementById('qrcode');
    const generateBtn = document.getElementById('generate-btn');
    const downloadIcsBtn = document.getElementById('download-ics-btn');
    // その他用
    const otherCheckbox = document.getElementById('other-checkbox');
    const otherPriceInput = document.getElementById('other-price');

    function setDateByMenu() {
      const today = new Date();
      let minMonths = null;
      checkboxes.forEach(cb => {
        if (cb.checked && cb.dataset.months) {
          const m = parseInt(cb.dataset.months, 10);
          if (isNaN(m)) return;
          if (minMonths === null || m < minMonths) {
            minMonths = m;
          }
        }
      });
      const target = new Date(today);
      if (minMonths !== null) {
        target.setMonth(target.getMonth() + minMonths);
      }
      dateEl.value = target.toISOString().split('T')[0];
    }

    function adjustToHalfHour(input) {
      const val = input.value;
      if (!val) return;
      const [hStr, mStr] = val.split(':');
      let h = parseInt(hStr, 10);
      let m = parseInt(mStr, 10);
      const rounded = Math.round(m / 30) * 30;
      if (rounded === 60) {
        h = (h + 1) % 24;
        m = 0;
      } else {
        m = rounded;
      }
      input.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  
    // 小計と合計を計算して表示
    function calculateAmounts() {
      let subtotal = 0;
      checkboxes.forEach(cb => {
        if (cb.checked) {
          // その他の場合は手入力金額を使う
          if (cb.classList.contains('other-checkbox')) {
            const val = parseInt(otherPriceInput.value, 10) || 0;
            subtotal += val;
          } else {
            subtotal += +cb.dataset.price;
          }
        }
      });
      subtotalEl.textContent = `¥${subtotal}`;
      const discount = +discountEl.value || 0;
      const total = Math.max(subtotal - discount, 0);
      totalEl.textContent = `¥${total}`;
      return total;
    }
  
    // QRコードを生成して表示
    function generateQRCode() {
      qrcodeContainer.innerHTML = '';
      // Googleカレンダー登録用URLを生成
      const title = 'サロン予約';
      const date = dateEl.value.replace(/-/g, '');
      const startTime = document.getElementById('start-time').value;
      const endTime = document.getElementById('end-time').value;
      if (!date || !startTime || !endTime) {
        alert('日付・開始時間・終了時間をすべて入力してください');
        return;
      }
      const dtStart = `${date}T${startTime.replace(':', '')}00`;
      const dtEnd = `${date}T${endTime.replace(':', '')}00`;
      // 通知3日前
      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dtStart}/${dtEnd}&trp=3d0m0s`;
      // qriousでQRコード生成
      const qr = new QRious({
        value: url,
        size: 300,
        level: 'L'
      });
      const img = document.createElement('img');
      img.src = qr.toDataURL();
      qrcodeContainer.appendChild(img);
    }
  
    checkboxes.forEach(cb => cb.addEventListener('change', () => {
      calculateAmounts();
      setDateByMenu();
    }));
    discountEl.addEventListener('input', calculateAmounts);
    // その他の金額入力時も再計算
    if (otherPriceInput) {
      otherPriceInput.addEventListener('input', () => {
        // チェックが入っていなければ自動でONにする
        if (!otherCheckbox.checked && otherPriceInput.value) {
          otherCheckbox.checked = true;
        }
        calculateAmounts();
      });
    }
    if (otherCheckbox) {
      otherCheckbox.addEventListener('change', calculateAmounts);
    }
    if (startTimeEl) {
      startTimeEl.addEventListener('change', () => adjustToHalfHour(startTimeEl));
    }
    if (endTimeEl) {
      endTimeEl.addEventListener('change', () => adjustToHalfHour(endTimeEl));
    }
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        generateQRCode();
      });
    }

    setDateByMenu();
  });