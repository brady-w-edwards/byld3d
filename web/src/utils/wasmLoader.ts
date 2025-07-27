import init, { create_random_point } from 'byld-kernel';

let wasmInitialized = false;

export async function initWasm() {
  if (!wasmInitialized) {
    await init();
    wasmInitialized = true;
  }
}

export { create_random_point };