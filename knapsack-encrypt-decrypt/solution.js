function calcKnapsack() {
  let arr = [1, 2];

  let i = 2;
  while (arr.length < 8) {
    arr[i] = arr.reduce((a, b) => a + b) + 1;
    i++;
  }

  return arr;
}

function gcd(a, b) {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

function modInverse(n, m) {
  let m0 = m;
  let y = 0,
    x = 1;

  if (m === 1) {
    return 0;
  }

  while (n > 1) {
    // q is quotient
    let q = Math.floor(n / m);
    let t = m;

    // m is remainder now, process same as Euclid's algorithm
    m = n % m;
    n = t;
    t = y;

    // Update x and y
    y = x - q * y;
    x = t;
  }

  // Make x positive
  if (x < 0) {
    x += m0;
  }

  return x;
}

function subsetSum(decryptedValue, knapsack) {
  let binary = "";
  for (let i = knapsack.length - 1; i >= 0; i--) {
    if (decryptedValue >= knapsack[i]) {
      binary = "1" + binary;
      decryptedValue -= knapsack[i];
    } else {
      binary = "0" + binary;
    }
  }
  return binary;
}

function binaryToAscii(binaryStr) {
  return String.fromCharCode(parseInt(binaryStr, 2));
}

function attemptDecryption(n, knapsack, encryptedString, m) {
  if (gcd(n, m) !== 1) {
    return null;
  }

  const inverseN = modInverse(n, m);

  const decryptedValues = encryptedString.map(
    (value) => (value * inverseN) % m,
  );

  let binaryMessage = "";
  for (let value of decryptedValues) {
    const binary = subsetSum(value, knapsack);
    binaryMessage += binary;
  }

  const asciiChars = [];
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.slice(i, i + 8);
    if (byte.length === 8) {
      const asciiChar = binaryToAscii(byte);
      asciiChars.push(asciiChar);
    }
  }

  const decryptedMessage = asciiChars.join("");

  return decryptedMessage;
}

function bruteForceDecrypt(knapsack, encryptedString, m) {
  for (let n = 1; n < m; n++) {
    if (gcd(n, m) !== 1) {
      continue;
    }

    const message = attemptDecryption(n, knapsack, encryptedString, m);

    console.log(`Possible n: ${n}`);
    console.log(`Decrypted Message: ${message}`);
  }
}

const m = 257;

const encryptedString = [
  538, 619, 944, 831, 360, 531, 468, 971, 635, 593, 655, 425, 1068, 530, 1068,
  360, 706, 1068, 299, 619, 670, 1068, 891, 425, 670, 1068, 371, 670, 732, 531,
  1068, 484, 372, 635, 371, 372, 237, 237, 1007,
];

bruteForceDecrypt(calcKnapsack(), encryptedString, m);
