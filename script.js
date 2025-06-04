let encodedBits = "";  // globalde saklayalım

function encodeData() {
  const input = document.getElementById("dataInput").value.trim();

  if (![8, 16, 32].includes(input.length)) {
    alert("Lütfen 8, 16 veya 32 bitlik veri girin.");
    return;
  }

  if (!/^[01]+$/.test(input)) {
    alert("Sadece 0 ve 1 içeren bir veri giriniz.");
    return;
  }

  const dataBits = input.split('').map(Number);
  const encoded = generateHammingSECDED(dataBits);
  encodedBits = encoded.join('');
  displayBitsWithColors(encodedBits);
  document.getElementById("syndromeOutput").textContent = "";
}

function generateHammingSECDED(dataBits) {
  const n = dataBits.length;
  let m = 0;
  while (Math.pow(2, m) < n + m + 1) {
    m++;
  }

  const totalLength = n + m + 1; // +1 genel parite biti
  const result = Array(totalLength).fill(0);

  let j = 0;
  for (let i = 1; i < totalLength; i++) {
    if ((i & (i - 1)) !== 0) {
      result[i] = dataBits[j++];
    }
  }

  for (let i = 0; i < m; i++) {
    const parityPos = Math.pow(2, i);
    let parity = 0;
    for (let k = 1; k < totalLength; k++) {
      if ((k & parityPos) !== 0 && k !== parityPos) {
        parity ^= result[k];
      }
    }
    result[parityPos] = parity;
  }

  // Genel parite (P0): tüm bitlerin XOR'u
  let overallParity = 0;
  for (let i = 1; i < totalLength; i++) {
    overallParity ^= result[i];
  }
  result[0] = overallParity;

  return result;
}


function introduceError() {
    if (!encodedBits) {
      alert("Lütfen önce bir veri kodlayın.");
      return;
    }
  
    const bits = encodedBits.split('');
    const errorPosition = Math.floor(Math.random() * bits.length); // 0 dahil
  
    // 0 ↔ 1 çevirme
    bits[errorPosition] = bits[errorPosition] === '0' ? '1' : '0';
  
    encodedBits = bits.join('');
    displayBitsWithColors(encodedBits);
  
    document.getElementById("syndromeOutput").innerHTML =
      `<strong>${errorPosition}. bit</strong> ters çevrildi!`;
}

function checkAndCorrect() {
    if (!encodedBits) {
      alert("Önce bir veri kodlayın.");
      return;
    }
  
    const bits = encodedBits.split('').map(Number);
    const n = bits.length;
    let m = 0;
    while (Math.pow(2, m) < n) {
      m++;
    }
  
    // Sendrom hesaplama
    let syndrome = 0;
    for (let i = 0; i < m; i++) {
      const parityPos = Math.pow(2, i);
      let parity = 0;
      for (let k = 1; k < n; k++) {
        if ((k & parityPos) !== 0 && k !== parityPos) {
          parity ^= bits[k];
        }
      }
  
      if (parity !== bits[parityPos]) {
        syndrome += parityPos;
      }
    }
  
    // Genel parite (SEC-DED için kontrol)
    const overallParity = bits.reduce((acc, bit) => acc ^ bit, 0);
  
    let message = "";
  
    if (syndrome === 0 && overallParity === 0) {
      message = "✅ Hata yok, veri doğru.";
    } else if (syndrome > 0 && overallParity === 1) {
      message = `❗ Hatalı bit: <strong>${syndrome}</strong>. Düzeltildi.`;
      bits[syndrome] = bits[syndrome] === 0 ? 1 : 0;
      encodedBits = bits.join('');
      displayBitsWithColors(encodedBits);
    } else if (syndrome === 0 && overallParity === 1) {
      message = "🚨 Çift hata tespit edildi (düzeltilemez).";
    } else {
      message = "❓ Tanımsız hata durumu.";
    }
  
    document.getElementById("syndromeOutput").innerHTML = message;
  }

function displayBitsWithColors(bits) {
    const n = bits.length;
    let m = 0;
    while (Math.pow(2, m) < n) m++;
  
    let html = "";
  
    for (let i = 0; i < n; i++) {
      if (i === 0) {
        // Genel parite biti (P0)
        html += `<span class="bit p0">${bits[i]}</span>`;
      } else if ((i & (i - 1)) === 0) {
        // 2’nin kuvveti → parite biti
        html += `<span class="bit parity">${bits[i]}</span>`;
      } else {
        // Diğerleri → veri biti
        html += `<span class="bit data">${bits[i]}</span>`;
      }
    }
  
    document.getElementById("hammingOutput").innerHTML = html;
}




  
  