/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.94.3
*/

import { ContractFactory, decompressBytecode } from "fuels";
import type { Provider, Account, DeployContractOptions, DeployContractResult } from "fuels";

import { CreatePoolAndAddLiquidityScript } from "./CreatePoolAndAddLiquidityScript";

const bytecode = decompressBytecode("H4sIAAAAAAAAA41Zb2xbVxW/dpzW65/1pYnb9PWfO6Wd0Ri4WluyUdh72MY2XsjN0qqJUs/22tJOazcvbUP4gGaJaZoQggw2NgES+bAP+cZzkuZP+WJgwCTGFISQOrGxFJiUslqKxooaTaL8zr332S/vvbBFit71ffedd+655/zO75ynL8fZJcaCTPztLefv1ALanTvsRcai/INlxv+J66LBorcfYAMfLwb5x4shrP9Iv8mxJtTJhyavlQy2oVBn3+b9U0s8Ub2m3zCY/j4ErHomsFtPLLDhJIvG6iED626vsa6d1vG0FR3OYG0qVMmbBjtpMpbPGkzLRo1CX5TxE1VD3D8xXeFZHh1+BONsR42nuPFYijGS7ZK7Qz+14Dffrhd85zeTHu2QNZJk29tNZowYLHAEVoLuVuGmdoSnJ7vlHjS3ff6up7GHnFVs6sXCYpzqqvGzUzXYIRY7EzKwth3yXijcZAchr3MNeW8pecYnyfPug31A+/CZf59k+sy/p+d859/We3F+nHXuMVtZvn851IYrfmt7UhH5G9fdZsiALuE9qS4jn6O5jgrN7U6FajxhzeHMMjHzWKVQr0QL9fI+nmUDwwZ0z77ECnXt3nzCiubT1r58zrqX904uQX4m1nOcwbfiw8ewru9lg5+YHNBvxIXv6Nc1pr8Lm70dZfpfuFvnXypfquC9MfIlnphaFmOzQ4xh84p+w23vlu+TbfJZjeV7tEA+pQXx/jLeH431teL9U2OFenS4UI9fhM6XIGNCnhsX+qyWFdrplpU3WQjyJiDjMmSMQMY3IaOm38B+3occr4xf0z7y8MV8lgXwfJD3Tg3guSch4zxi7wJPTL5q28S1lxFlgwnsWyMbwN5abLCD5c1iID9YZPsHGXsZwf/jMN4v4pqV9cQ409NjTM9VmN67CPtbUakf7H3d4xu60A8xCl3uwrsyOOsY2dWrD9u5GgcsLsaJ6eY4Cz/+iLEfkh4rcfYq9HoF+n3tttBzva2n1BH65RZZgWL+Ft63ErXXr1frnfsqNve1iPNg5L/Q4zDjvYgtGvdeacxrPYdZwYwj3oFFFGuJ6ZqMuVCN3gX9io732fo13iffhfdk6dyittywLVe/BZ9d0dzPb/F7/qR6XuuJGz7PbpHP7r3T3OuGsv4knj+LvZ6CjQplyCsyfQhyT0BmenmbltJqiNHtwNTafY8wFjERo71VisMozmELrvsIkyjGYymy0ZXbYtwTAT6QL8RdZxv8AjcM+NqcwiaK+Suavx+siwu/vGi9IM78GeELy/DnPfi9Ge/ei3eHbZ+Ff49K7HitwnMznZCvCRxMT2f0G7CFBzODD1HciefriPX0/IIYp5Ev0leK3pgPvuiN+bnR4fN4Z9867GOuVqjv6yzUD+4o1Nt0yLDs/OWN1+BVb7zOZfDcXZCBXBnYCLuM+cdr8LsqXmm/au9XNTEWmDW/wHOzZF/sH36Ivbvi/V/i+dxsw0Y+a67LfFKdkPnkdeyNPQibP8QTM6OwfzxmdhmwbdmOedfzX3FjCvQiXFU6zsbsMT3velZiWXq5U/lf2/1G6FHdQM5JAmdy08ipNs6s1vsyY/9t4kygG+8UmOla8x7trR3nOJJhD7anNAP5W+bt9GQMeTvl88xNmfM88x9SzuP90w1sdu3l53o/7j+NvFZGTrmQ9pPxb1rjM78i/b9ahM9/Fnngfp6taTgP5MLpGsbdj4Hv4Go8hvjnpkaxAP9/Hf4/TzmT42yJu7WCP2jgD/eI+STNUyxNLYkxzjGfqN5H/EVPgsuAw+hJ+HhieYdmshrytq71GTWemyQfILntuA4i3haE/5jgF7kZh79RLLv9KfAg1i/Ctid5knRW3ETE5yz5scq9s+OCsyGGbUzQr4+5bYpcNhWGrJJHVmo8Cr8mDIaNCFtml8Q9U/q4lFdxyxtUmEQ+KfgkYi/uj0mtG8WZnALeEyaVhB3jhbrxDfwOIT7O8vQU8U7l81O8gUlZlpF6XYK9Zrub+HSF++NTYKvidIvNtfNyTJwufWXUi1GBcz4YdW34JGFUa40X5sGp9nUBo/YDaw5AxhsSo4D9HowKePHOZBnwkhrkgWe11sDFRuE35DOfV2PiwEH4ztYjBvHgqRqeCfP+qxzPEDeq8f4ZwvC/wZ/fg70WgSET+hLZ2o/XBL/n3c+M0ZCVmKHYeBOy/ghZb0EWeN9amBv41SrM7QHmJuYnEB+fcegZd+h5DbL/CtnvQPa7kD2mL63Fv4KPe/Wc73boGYOs30LW7yDr97D74v/R8xU/PZFfsNe2TTg/5L6Dd0PGuD/2BoIKe2VOkPmBaiU7PyzC/8gX18gP2IvMDwNr54fgoMoP12TsPUfY8DD2hniYmXDkB4HvPjqK/AcdHbFyVeZimR/OrZ0fkLdlfti5Rn5AjbNWfgg+78gPwKT5N6Djkr+OQck/0uCcCp9EHQJerN8qgtuBP61wxa/23nFzT3BJw8klVZwEibfC57aBy8Qb+0Ut668Da1NcGBxF8B9NjMGFEWPtqIOCqINaDgVCj+J3B8UcOKfh5bgBB+8LSI57CnoVYC/nGeSqYe9Zs37KfTjnzlidsF7gUWcshxzUaxH364z17CecGhXj7GGWH7K25E9YGnRrwxrFCVuJJ8fF2BR8esyeB3a0Q2ZYA7/UzC7wzFZRS1Pugs2DO48fYweOMRbbfbqiD5RJzrjMPR1Yf7qS77UigocjhmGTDprnZlTIw/6sQr24rVDn2+GjnaKGyEBPafc3xFj4XzXTmMeYp6t0PvY9nI9vrXKv8hHpr3btVCIfqeAsYOuVsjqLgO0jDf4OH8nYHH44E2IHMpjPYH+wK/CiheZwDSF3twpd6odwRrChsr+4Iv/qt8S5Z7x8nz3seNc5pz/iHVyeHWp0Q8gmu8aETNQxsGkr7KmhrjOAW2HeY4RR34axnvxQckczSTrQvu1655zD9x5WOjzr8L2Jhg5DqDlQZ2A/yxJDRG2hSZ0iZFOVs8GBPRjJvq64O/Smc6wWxZi4ewr9qFy1CFkxUa8JWThbkpsSfor+E/FqLz5AbrfKubQ/+DLl3OqoGFPORX6jPhPNYQ1xY7VGnQmtkT0dMZ/vtzbBjpvhk3drWc2IZLtq4JzSrzPw655DlQOoq2K7k4bOy+hdJQWX00zgKPg9eAVqrLgGv22DzZv+mUbsNH1TjqXfjgEfOmODqI8FRsHeDYxiz/r4BPep4zsbfYyE1Y0xZEdE30jkq39YbpuJPpjIV32ylikgDxayRqCQBd6hDoVfcEedbvuFA5PYwifoMWfrIfbX7AuQrxrAmw3Am43AkU3Ey7RUyIikIoLXC1snBYYYCkOYwBCKWcrPqVRN6zvNZK6OUJ8sCtwg+78A3GgDbmyF/dGDgy3Ih0zhm+PSn1TsgGerfS449mnHuxN7Vc3eiEHUvqtr5MsssJ5qinxfnOWPx5H/40E+ZL0q9BskDmfNwS+AZRwYEd8BGaiHULcLDueWxQbcsvKD6C0VrAXI0CFjJ2TsIixYSwbsd59HhomaYshagozdkLEHMvZCxjmZwyDHK0P2f9CfsH2En7DQ4yPfNmBjtlX2g9B7cGEs7CHysMCZeqgm8DU9LXo58G9nP8e2twNv2JiPX40KX+qzfSlJZ015CfiB3s6QtQ6+tB4xGxa9mL4Ii/SljBGufImTLx2385FBvgT/Qc8ZvRuDclgH+Qdq+SJqeU59b9TyKk9K3ymu4TtjDt+xY9XJJ7RmrhC2qOgJS3AZhf+aA//9eltu/EdfxNujucxCv1F9XNH38taloV+InNeLGkj1w7DHsOBGqUPqXFblAdW3anHEQYuDg+BchoiHVBs9WNqT4ktRxHTcW1dUK4Kvy1pL1mzpScJBVb9Nwp/98nXgpw5Op9aq7wTmc8R/Gv34o9lLxNP+43hX43sD+rtRl39/KGp4YPk2cBula0TqOgkb+vVxAttWc7vqXJPbWbR/mwO14Hc37rW0A5fU3DzkCuzwkQuMcfN/8HTFNSEr6JANPa2jytY/wviLPvfo93dc90ino4SrSqdn1rhv67xrjfshdZ+wm+7btlPnjH7fTbYHvYcFYRv0LWQ/w0Ivge1yzvOzk4sCG8500bllYR9wNj/7sDnH9yPbPsQDbftAp9W9EOSRffJ7lEfWD+x6Qn0H2uT1VauGXkVnKXUQeKDtgM6WYy/ricvifkcpFUdtp0Wc96nnL/aUEnuifVewb03MN3Vfcug+4PwOhd9fxj4XIF8nzEac7mzaiXBqclnKf4nkr4N8+m61De/YLu416oIpwiqqBW09xrBmq5hv6DqlOXSlfZUh6+5S6oEg9rVF3G/qLPuCUufHXT53xPYD6mUjh/0ZZ1kW/RbzGNkEvRnfWuk1da7E2+3YJqyk/g9xRBW/z1W+ZB7+k/x+ABxaKSqcavGr4cJ6YpHpH3g4T5uo91Oa3Udcp/qIjXMvJQO0LlBKsnUKE8P6CnPjs7MWwLskvpfAEdt7omzkEdbaju+ZxBnpPPWMRrYN6KgTCia4scR9yPXwfifu14TcfmAt8p+LH4geeATnR+9ol9dsyWyx/fkorrSvuIh18CqM7xFxLccdjhgm/4nCL0LgwHReTh8vwheIm1GPbLPzvvj2ttpvONZuoHdg7Ub1bU75IXhv0w9prYG1YdINa+8S95tyxx1ySbc41q7D/3pxrynTcsikdeiVakHso0XcU/LEmr4u2NygdVSTyZjoJy5i0DnUfL5Fub7VyNzr/EbkyJPi7D7N3x38Jc+UTp9/4qkz0XLp4sUzp1n56afPFy6cuVQ6XbpU+hQyONZHS+eHIeZb0TOjT1y8dFHMX3jiKWxPvoP+3hR/aMTt/8OR57/6uZ/IWfs+ko342/EzdX1NXrcfldfIO+oKa9Ff267/ASWrWsVQIAAA");

export class CreatePoolAndAddLiquidityScriptFactory extends ContractFactory {

  static readonly bytecode = bytecode;

  constructor(accountOrProvider: Account | Provider) {
    super(bytecode, CreatePoolAndAddLiquidityScript.abi, accountOrProvider);
  }

  static async deploy (
    wallet: Account,
    options: DeployContractOptions = {}
  ): Promise<DeployContractResult<CreatePoolAndAddLiquidityScript>> {
    const factory = new CreatePoolAndAddLiquidityScriptFactory(wallet);

    return factory.deploy({
      storageSlots: CreatePoolAndAddLiquidityScript.storageSlots,
      ...options,
    });
  }
}
