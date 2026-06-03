import { TaxLearningModule } from './taxLearningTypes';
import { pengantarHukumPajakModule } from './modules/pengantarHukumPajak';
import { kupModule } from './modules/kup';
import { pengenalanLaporanKeuanganModule } from './modules/pengenalanLaporanKeuangan';
import { pphOrangPribadiModule } from './modules/pphOrangPribadi';
import { ppnPpnbmModule } from './modules/ppnPpnbm';
import { beaMeteraiModule } from './modules/beaMeterai';
import { pbbBphtbModule } from './modules/pbbBphtb';
import { pphPotputModule } from './modules/pphPotput';
import { pphBadanModule } from './modules/pphBadan';
import { perencanaanPajakModule } from './modules/perencanaanPajak';
import { pemeriksaanPajakModule } from './modules/pemeriksaanPajak';
import { akuntansiPerpajakanModule } from './modules/akuntansiPerpajakan';
import { coretaxEsptModule } from './modules/coretaxEspt';

export * from './taxLearningTypes';

export const TAX_LEARNING_MODULES: TaxLearningModule[] = [
  pengantarHukumPajakModule,
  kupModule,
  pengenalanLaporanKeuanganModule,
  pphOrangPribadiModule,
  ppnPpnbmModule,
  beaMeteraiModule,
  pbbBphtbModule,
  pphPotputModule,
  pphBadanModule,
  perencanaanPajakModule,
  pemeriksaanPajakModule,
  akuntansiPerpajakanModule,
  coretaxEsptModule,
];

export function getTaxLearningModule(slug: string) {
  return TAX_LEARNING_MODULES.find((learningModule) => learningModule.slug === slug);
}
