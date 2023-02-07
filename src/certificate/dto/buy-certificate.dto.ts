import { ERestaurant } from "../../entities/certificate.entity";

export class BuyCertificateDto {
  restaurant!: ERestaurant;
  price!: number;
  count?: number;
  email!: string;
}
