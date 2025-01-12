import { randomInt } from 'crypto';
import FragmentBase from '../FragmentBase.js';
import { DestructuredFragment } from '../@types';

/**
 * RandomFragment class for random IDs.
 * @public
 */
export default class RandomFragment extends FragmentBase {
  /**
   * @remarks
   * When using a custom random function, please ensure it returns a positive number
   * no greater than `2 ** bits - 1`.
   *
   * @param bits - The number of bits for the fragment.
   * @param func - Optional custom random function.
   *
   * @throws `[RND_FUNCTION_RETURN_TYPE]` If custom function does not return number or bigint.
   */
  constructor(bits: number, private readonly fn?: () => number | bigint) {
    super(bits);

    if (fn && !['number', 'bigint'].includes(typeof fn()))
      throw new TypeError(
        `[RND_FUNCTION_RETURN_TYPE]: RandomFragment custom function return is of type: ${typeof fn()}; Expected number or bigint.`,
      );
  }

  getValue(): bigint {
    if (this.fn) return BigInt(this.fn());
    // 48 bit parts due to randomInt range limitation
    // and max param limit of Number.MAX_SAFE_INTEGER
    let rndNum = BigInt(1);
    for (let i = 1; i < this.bits / 48; i += 1) {
      rndNum *= BigInt(randomInt(1, 2 ** 48));
    }
    rndNum *= BigInt(randomInt(1, 2 ** (this.bits % 48)));

    return rndNum - BigInt(1);
  }

  destructure(snowflake: number | bigint | string): DestructuredFragment {
    const bits = BigInt(snowflake) & this.bitMask;

    return {
      identifier: this.identifier,
      value: bits >> this.bitShift,
    };
  }
}
