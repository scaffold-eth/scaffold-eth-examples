//SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.3;

contract VerifyVDF {
  uint256 constant RSA_MODULUS_0 = 0x31f55615172866bccc30f95054c824e733a5eb6817f7bc16399d48c6361cc7e5;
  uint256 constant RSA_MODULUS_1 = 0xbc729592642920f24c61dc5b3c3b7923e56b16a4d9d373d8721f24a3fc0f1b31;
  uint256 constant RSA_MODULUS_2 = 0xf6135809f85334b5cb1813addc80cd05609f10ac6a95ad65872c909525bdad32;
  uint256 constant RSA_MODULUS_3 = 0xf7e8daefd26c66fc02c479af89d64d373f442709439de66ceb955f3ea37d5159;
  uint256 constant RSA_MODULUS_4 = 0xb4f14a04b51f7bfd781be4d1673164ba8eb991c2c4d730bbbe35f592bdef524a;
  uint256 constant RSA_MODULUS_5 = 0xa31f5b0b7765ff8b44b4b6ffc93384b646eb09c7cf5e8592d40ea33c80039f35;
  uint256 constant RSA_MODULUS_6 = 0x7ff0db8e1ea1189ec72f93d1650011bd721aeeacc2acde32a04107f0648c2813;
  uint256 constant RSA_MODULUS_7 = 0xc7970ceedcc3b0754490201a7aa613cd73911081c790f5f1a8726f463550bb5b;
  bytes RSA_MODULUS =
    hex"c7970ceedcc3b0754490201a7aa613cd73911081c790f5f1a8726f463550bb5b7ff0db8e1ea1189ec72f93d1650011bd721aeeacc2acde32a04107f0648c2813a31f5b0b7765ff8b44b4b6ffc93384b646eb09c7cf5e8592d40ea33c80039f35b4f14a04b51f7bfd781be4d1673164ba8eb991c2c4d730bbbe35f592bdef524af7e8daefd26c66fc02c479af89d64d373f442709439de66ceb955f3ea37d5159f6135809f85334b5cb1813addc80cd05609f10ac6a95ad65872c909525bdad32bc729592642920f24c61dc5b3c3b7923e56b16a4d9d373d8721f24a3fc0f1b3131f55615172866bccc30f95054c824e733a5eb6817f7bc16399d48c6361cc7e5";

  uint256 constant MILLER_RABIN_ROUNDS = 15;
  uint256 constant MAX_NONCE = 65536;

  constructor() {}

  function verify(
    bytes memory g,
    bytes memory pi,
    bytes memory y,
    bytes memory q,
    bytes memory dst,
    uint256 nonce,
    uint256 delay
  ) public view returns (bool) {
    require(validateNonce(nonce), "invalid nonce");
    require(validateGroupElement(g), "invalid group element: g");
    require(!isZeroGroupElement(g), "zero group element: g");
    require(validateGroupElement(pi), "invalid group element: pi");
    require(!isZeroGroupElement(pi), "zero group element: pi");
    require(validateGroupElement(y), "invalid group element: y");
    require(!isZeroGroupElement(y), "zero group element: y");
    require(validateGroupElement(q), "invalid group element: helper q");

    uint256 l = hashToPrime(g, y, nonce, dst);
    if (l & 1 == 0) {
      l += 1;
    }
    require(millerRabinPrimalityTest(l), "non prime challenge");

    uint256 r = modexp(2, delay, l);
    bytes memory u1 = modexp(pi, l);
    bytes memory u2 = modexp(g, r);

    require(mulModEqual(u1, u2, y, q), "verification failed");
    return true;
  }

  function hashToPrime(
    bytes memory g,
    bytes memory y,
    uint256 nonce,
    bytes memory dst
  ) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(dst, g, y, nonce)));
  }

  // a * b =? N*q + y
  function mulModEqual(
    bytes memory a,
    bytes memory b,
    bytes memory y,
    bytes memory q
  ) internal view returns (bool) {
    bytes memory u1 = mul2048(a, b);
    bytes memory u2 = mul2048(q, RSA_MODULUS);
    add2048to4096(u2, y);
    return equalNumber(u1, u2);
  }

  function equalNumber(bytes memory a, bytes memory b) internal pure returns (bool res) {
    uint256 len = a.length;
    if (len == 0) {
      return false;
    }
    if (len % 32 != 0) {
      return false;
    }
    if (len != b.length) {
      return false;
    }
    uint256 i = 0;
    res = true;
    assembly {
      for {
        let ptr := 32
      } lt(ptr, add(len, 1)) {
        ptr := add(ptr, 32)
      } {
        i := add(i, 1)
        res := and(res, eq(mload(add(a, ptr)), mload(add(b, ptr))))
      }
    }
  }

  function millerRabinPrimalityTest(uint256 n) internal view returns (bool) {
    // miller rabin primality tests code is
    // borrowed from https://github.com/dankrad/rsa-bounty/blob/master/contract/rsa_bounty.sol

    if (n < 4) {
      return false;
    }
    if (n & 1 == 0) {
      return false;
    }
    uint256 d = n - 1;
    uint256 r = 0;
    while (d & 1 == 0) {
      d /= 2;
      r += 1;
    }
    for (uint256 i = 0; i < MILLER_RABIN_ROUNDS; i++) {
      // pick a random integer a in the range [2, n − 2]
      uint256 a = (uint256(keccak256(abi.encodePacked(n, i))) % (n - 3)) + 2;
      uint256 x = modexp(a, d, n);
      if (x == 1 || x == n - 1) {
        continue;
      }
      bool check_passed = false;
      for (uint256 j = 1; j < r; j++) {
        x = mulmod(x, x, n);
        if (x == n - 1) {
          check_passed = true;
          break;
        }
      }
      if (!check_passed) {
        return false;
      }
    }
    return true;
  }

  function modexp(
    uint256 base,
    uint256 exponent,
    uint256 modulus
  ) internal view returns (uint256 res) {
    assembly {
      let mem := mload(0x40)

      mstore(mem, 0x20)
      mstore(add(mem, 0x20), 0x20)
      mstore(add(mem, 0x40), 0x20)
      mstore(add(mem, 0x60), base)
      mstore(add(mem, 0x80), exponent)
      mstore(add(mem, 0xa0), modulus)

      let success := staticcall(sub(gas(), 2000), 5, mem, 0xc0, mem, 32)
      switch success
        case 0 {
          revert(0x0, 0x0)
        }
      res := mload(mem)
    }
  }

  function modexp(bytes memory base, uint256 exponent) internal view returns (bytes memory res) {
    // bytes memory res // = new bytes(256);
    assembly {
      let mem := mload(0x40)

      mstore(mem, 256) // <length_of_BASE> = 256
      mstore(add(mem, 0x20), 0x20) // <length_of_EXPONENT> = 32
      mstore(add(mem, 0x40), 256) // <length_of_MODULUS> = 256

      mstore(add(mem, 0x60), mload(add(base, 0x20)))
      mstore(add(mem, 0x80), mload(add(base, 0x40)))
      mstore(add(mem, 0xa0), mload(add(base, 0x60)))
      mstore(add(mem, 0xc0), mload(add(base, 0x80)))
      mstore(add(mem, 0xe0), mload(add(base, 0xa0)))
      mstore(add(mem, 0x100), mload(add(base, 0xc0)))
      mstore(add(mem, 0x120), mload(add(base, 0xe0)))
      mstore(add(mem, 0x140), mload(add(base, 0x100)))

      mstore(add(mem, 0x160), exponent)

      mstore(add(mem, 0x180), RSA_MODULUS_7)
      mstore(add(mem, 0x1a0), RSA_MODULUS_6)
      mstore(add(mem, 0x1c0), RSA_MODULUS_5)
      mstore(add(mem, 0x1e0), RSA_MODULUS_4)
      mstore(add(mem, 0x200), RSA_MODULUS_3)
      mstore(add(mem, 0x220), RSA_MODULUS_2)
      mstore(add(mem, 0x240), RSA_MODULUS_1)
      mstore(add(mem, 0x260), RSA_MODULUS_0)

      let success := staticcall(sub(gas(), 2000), 5, mem, 0x280, add(mem, 0x20), 256)
      switch success
        case 0 {
          revert(0x0, 0x0)
        }
      // update free mem pointer
      mstore(0x40, add(mem, 0x120))
      res := mem
    }
  }

  function mul2048(bytes memory a, bytes memory b) internal pure returns (bytes memory res) {
    assembly {
      let mem := mload(64)
      mstore(mem, 512)
      mstore(64, add(mem, 576))

      let r := not(0)
      let u1
      let u2
      let u3
      let mm
      let ai

      // a0 * bj
      {
        ai := mload(add(a, 256)) // a0
        u1 := mload(add(b, 256)) // b0

        // a0 * b0
        mm := mulmod(ai, u1, r)
        u1 := mul(ai, u1) // La0b0
        u2 := sub(sub(mm, u1), lt(mm, u1)) // Ha0b0

        // store z0 = La0b0
        mstore(add(mem, 512), u1)
        // u1, u3 free, u2: Ha0b0

        for {
          let ptr := 224
        } gt(ptr, 0) {
          ptr := sub(ptr, 32)
        } {
          // a0 * bj
          u1 := mload(add(b, ptr))
          {
            mm := mulmod(ai, u1, r)
            u1 := mul(ai, u1) // La0bj
            u3 := sub(sub(mm, u1), lt(mm, u1)) // Ha0bj
          }

          u1 := add(u1, u2) // zi = La0bj + Ha0b_(j-1)
          u2 := add(u3, lt(u1, u2)) // Ha0bj = Ha0bj + c
          mstore(add(mem, add(ptr, 256)), u1) // store zi
          // carry u2 to next iter
        }
      }

      mstore(add(256, mem), u2) // store z_(i+8)

      // ai
      // i from 1 to 7
      for {
        let optr := 224
      } gt(optr, 0) {
        optr := sub(optr, 32)
      } {
        mstore(add(add(optr, mem), 32), u2) // store z_(i+8)
        ai := mload(add(a, optr)) // ai
        u1 := mload(add(b, 256)) // b0
        {
          // ai * b0
          mm := mulmod(ai, u1, r)
          u1 := mul(ai, u1) // La1b0
          u2 := sub(sub(mm, u1), lt(mm, u1)) // Haib0
        }

        mm := add(mem, add(optr, 256))
        u3 := mload(mm) // load zi
        u1 := add(u1, u3) // zi = zi + Laib0
        u2 := add(u2, lt(u1, u3)) // Haib0' = Haib0 + c
        mstore(mm, u1) // store zi
        // u1, u3 free, u2: Haib0

        // bj, j from 1 to 7
        for {
          let iptr := 224
        } gt(iptr, 0) {
          iptr := sub(iptr, 32)
        } {
          u1 := mload(add(b, iptr)) // bj
          {
            // ai * bj
            mm := mulmod(ai, u1, r)
            u1 := mul(ai, u1) // Laibj
            u3 := sub(sub(mm, u1), lt(mm, u1)) // Haibj
          }
          u1 := add(u1, u2) // Laibj + Haib0
          u3 := add(u3, lt(u1, u2)) // Haibj' = Haibj + c
          mm := add(mem, add(iptr, optr))
          u2 := mload(mm) // zi
          u1 := add(u1, u2) // zi = zi + (Laibj + Haib0)
          u2 := add(u3, lt(u1, u2)) // Haibj' = Ha1bj + c
          mstore(mm, u1) // store zi
          // carry u2 to next iter
        }
      }
      mstore(add(32, mem), u2) // store z15
      res := mem
    }
  }

  function add2048to4096(bytes memory a, bytes memory b) internal pure {
    assembly {
      let a_ptr := add(a, 0x220)
      let b_ptr := add(b, 0x120)
      let c

      let ai := mload(a_ptr)
      let bi := mload(b_ptr)
      ai := add(ai, bi)
      c := lt(ai, bi)
      mstore(a_ptr, ai)

      for {
        let off := 0x20
      } lt(off, 0x101) {
        off := add(off, 0x20)
      } {
        a_ptr := sub(a_ptr, 0x20)
        b_ptr := sub(b_ptr, 0x20)
        ai := mload(a_ptr)
        bi := mload(b_ptr)

        ai := add(ai, c)
        c := lt(ai, c)
        ai := add(ai, bi)
        c := add(c, lt(ai, bi))
        mstore(a_ptr, ai)
      }

      for {
        let off := 0x0
      } lt(off, 0x20) {
        off := add(off, 0x20)
      } {
        a_ptr := sub(a_ptr, 0x20)
        ai := mload(a_ptr)
        ai := add(ai, c)
        c := lt(ai, c)
        mstore(a_ptr, ai)
      }
    }
  }

  function validateGroupElement(bytes memory e) internal pure returns (bool valid) {
    if (e.length != 256) {
      return false;
    }
    valid = true;
    assembly {
      let ei := mload(add(e, 0x20))
      valid := lt(ei, RSA_MODULUS_7)
      if eq(ei, RSA_MODULUS_7) {
        ei := mload(add(e, 0x40))
        valid := lt(ei, RSA_MODULUS_6)
        if eq(ei, RSA_MODULUS_6) {
          ei := mload(add(e, 0x60))
          valid := lt(ei, RSA_MODULUS_5)
          if eq(ei, RSA_MODULUS_5) {
            ei := mload(add(e, 0x80))
            valid := lt(ei, RSA_MODULUS_4)
            if eq(ei, RSA_MODULUS_4) {
              ei := mload(add(e, 0xa0))
              valid := lt(ei, RSA_MODULUS_3)
              if eq(ei, RSA_MODULUS_3) {
                ei := mload(add(e, 0xc0))
                valid := lt(ei, RSA_MODULUS_2)
                if eq(ei, RSA_MODULUS_2) {
                  ei := mload(add(e, 0xe0))
                  valid := lt(ei, RSA_MODULUS_1)
                  if eq(ei, RSA_MODULUS_1) {
                    ei := mload(add(e, 0x100))
                    valid := lt(ei, RSA_MODULUS_0)
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  function isZeroGroupElement(bytes memory e) internal pure returns (bool isZero) {
    if (e.length != 256) {
      return false;
    }
    isZero = true;
    assembly {
      for {
        let off := 0x20
      } lt(off, 0x101) {
        off := add(off, 0x20)
      } {
        isZero := and(isZero, eq(mload(add(e, off)), 0))
      }
    }
  }

  function validateNonce(uint256 nonce) internal pure returns (bool) {
    return nonce < MAX_NONCE;
  }
}
