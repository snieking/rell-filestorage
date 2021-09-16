import { KeyPair, nop, op, User } from 'ft3-lib';
import Filehub from './Filehub';
import { IFilechainLocation } from '../models/FilechainLocation';
import Filechain from './Filechain';

export default class FilehubAdministrator {
  private readonly filehub: Filehub;
  private readonly admin: KeyPair;

  public constructor(filehub: Filehub, admin: KeyPair) {
    this.filehub = filehub;
    this.admin = admin;
  }

  /**
   * Registers a Filechain to persist files in.
   *
   * @param user that is an admin of the filehub.
   * @param rid of the filechain.
   */
  public async registerFilechain(rid: string, url: string) {
    const trxBuilder = await this.filehub.transactionBuilder();
    return trxBuilder
      .add(op('admin.add_filechain', rid, url))
      .build([this.admin.pubKey])
      .sign(this.admin)
      .post();
  }

  /**
   * Disables a Filechain
   */
  public async disableFilechain(rid: string) {
    const trxBuilder = await this.filehub.transactionBuilder();
    return trxBuilder
      .add(op('admin.disable_filechain', rid))
      .add(nop())
      .build([this.admin.pubKey])
      .sign(this.admin)
      .post();
  }

  /**
   * Enables a Filechain
   */
  public async enableFilechain(rid: string, url: string) {
    const trxBuilder = await this.filehub.transactionBuilder();
    return trxBuilder
      .add(op('admin.enable_filechain', rid, url))
      .add(nop())
      .build([this.admin.pubKey])
      .sign(this.admin)
      .post();
  }

  /**
   * Gets a Filechain from a filechain location.
   */
  public getFilechain(filechainLocation: IFilechainLocation): Filechain {
    return this.filehub.initFilechainClient(filechainLocation);
  }
}
