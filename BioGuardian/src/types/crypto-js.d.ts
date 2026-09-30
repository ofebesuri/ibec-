declare module 'crypto-js' {
  export interface SHA256 {
    (message: string): WordArray;
  }

  export interface AES {
    encrypt(message: string, password: string): CipherParams;
    decrypt(encrypted: string, password: string): WordArray;
  }

  export interface CipherParams {
    toString(encoder?: any): string;
  }

  export interface WordArray {
    toString(encoder?: any): string;
  }

  export interface UTF8 {
    Utf8: any;
  }

  export interface AESModule {
    SHA256: SHA256;
    AES: AES;
    enc: UTF8;
  }

  const CryptoJS: AESModule;
  export default CryptoJS;
}
