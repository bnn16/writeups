# CTF Writeup: IronCTF Challenge - Knapsack Encryption Decryption

Dantzig was on a trip with his friends and one day, they decided to play a game or atleast, it's easier version. He would think of a string and the others have to find it based on the clues he gives them.

1. The knapsack list contains 8 numbers, with 1 and 2 as the first two numbers and the subsequent numbers are formed by adding one to the sum of all the numbers before.
2. The value of m=257 and n is something less than 257
3. The encrypted string is -
   **[538, 619, 944, 831, 360, 531, 468, 971, 635, 593, 655, 425, 1068, 530, 1068, 360, 706, 1068, 299, 619, 670, 1068, 891, 425, 670, 1068, 371, 670, 732, 531, 1068, 484, 372, 635, 371, 372, 237, 237, 1007]**

The goal was to decrypt the message and find the original string Dantzig was thinking of.

# My Thought Process and Approach

When I first read the problem, I had no idea what this problem was on about.
So after a quick google search I found it was inspired by knapsack-based cryptography.

However, I wasn’t sure how to set up the knapsack sequence, what n was, or how the decryption process would work, so I approached the problem in stages.

### Step 1: Generate the Superincreasing Knapsack

I initially had no idea what a knapsack sequence was. After researching it, I learned that a superincreasing knapsack is a sequence where each number is larger than the sum of all previous numbers.
The challenge provided specific rules for generating the knapsack sequence, which helped me structure it. I understood that the sequence would be built by starting with [1, 2] and adding one to the sum of all previous numbers until I had eight elements. This sequence is what’s referred to as superincreasing:
**_Knapsack=[1,2,4,8,16,32,64,128]_**

### Step 2: Brute-Force Search for n

Since the problem didn't specify the value of n, I decided to try all possible values of n from 1 to 256 (as n must be less than m = 257).

#### How I Found n:

- For each possible n, I checked if it was coprime with 257 (i.e., gcd(n, 257) === 1). Only values of n that are coprime with 257 would have a modular inverse.
- For each valid n, I calculated its modular inverse modulo 257. This inverse allowed me to "undo" the encryption process by reversing the multiplication by n.

### Step 3: Calculate the Modular Inverse with the Extended Euclidean Algorithm

At first, I wasn’t very comfortable with the Extended Euclidean Algorithm used to find the modular inverse. So I went to youtube to look at how it works -> https://www.youtube.com/watch?v=hB34-GSDT3k

I understood that the algorithm provides a way to express the GCD of two numbers (in this case, n and m) as a combination of n and m. If the GCD is 1, the modular inverse of n modulo 257 can be found by reversing the steps of the Euclidean algorithm.

This inverse was essential because it allowed me to "undo" the encryption for each n I tested.

### Step 4: Decrypt the Ciphertext with Each n

With each valid n and its inverse, I could proceed with decrypting the ciphertext:

Multiply each encrypted value by the modular inverse of n modulo 257.
Take the result modulo 257 to get decrypted values, which would correspond to subset sums of the original knapsack.

### Step 5: Solve the Subset Sum Problem

Each decrypted value represented a subset sum of the knapsack elements. Here, I initially struggled a bit with the process, but after a deeper dive, I realized that each knapsack element in the subset translates to a 1 in the binary string, and elements not in the subset translate to 0.

This binary string was essential for reconstructing the original message since each 8-bit sequence could then be converted into an ASCII character.

### Step 6: Convert Binary to ASCII and Validate

Each 8-bit binary string represented an ASCII character, allowing me to reconstruct the message. To verify the decrypted message, I checked for valid printable ASCII characters, which would indicate a successful decryption.

## Solution Code

I know the solution is messy and the code can be optimised, but it got the job done.
Flag: Possible n: 31
Decrypted Message: ironCTF{M4th\_&_C5_ar3_7h3_b3sT_c0Mb0!!}
Here’s the code that successfully decrypted the message:

```js
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
```
