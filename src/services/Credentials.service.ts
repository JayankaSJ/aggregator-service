import { injectable } from "inversify";
import { Credential } from "@/entities/Credential.entity";
import { dataSource } from "@/config/typeorm.config";

@injectable()
export class CredentialsService {
  async get(source: string): Promise<Credential | null> {
    const credentialRepository = dataSource.getRepository(Credential);
    const credential = await credentialRepository.findOne({
      where: { source },
    });
    return credential;
  }
}
