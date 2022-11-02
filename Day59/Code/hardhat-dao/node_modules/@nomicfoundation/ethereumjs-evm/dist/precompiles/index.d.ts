import { Address } from '@nomicfoundation/ethereumjs-util';
import { PrecompileFunc, PrecompileInput } from './types';
import type { Common } from '@nomicfoundation/ethereumjs-common';
interface Precompiles {
    [key: string]: PrecompileFunc;
}
declare const ripemdPrecompileAddress = "0000000000000000000000000000000000000003";
declare const precompiles: Precompiles;
declare type DeletePrecompile = {
    address: Address;
};
declare type AddPrecompile = {
    address: Address;
    function: PrecompileFunc;
};
declare type CustomPrecompile = AddPrecompile | DeletePrecompile;
declare function getActivePrecompiles(common: Common, customPrecompiles?: CustomPrecompile[]): Map<string, PrecompileFunc>;
export { AddPrecompile, CustomPrecompile, DeletePrecompile, getActivePrecompiles, PrecompileFunc, PrecompileInput, precompiles, ripemdPrecompileAddress, };
//# sourceMappingURL=index.d.ts.map