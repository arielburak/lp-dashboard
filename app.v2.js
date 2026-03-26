// Quick "Offered [Firm]" — marks sent + adds feedback note
window.quickOffered = function(uid, hiringFirm) {
  const note = 'offered ' + hiringFirm;
  markStatus(uid, 'sent');
  fetch('https://lp-dashboard-7f594-default-rtdb.firebaseio.com/candidate_feedback/' + uid + '/notes.json', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({text: note, ts: Date.now()})
  });
  const row = document.getElementById('row-' + uid);
  if (row) {
    const btn = row.querySelector('.offered-btn');
    if (btn) { btn.textContent = '\u2713 Offered'; btn.style.background = '#c4b5fd'; btn.disabled = true; }
  }
};







// --- Firebase Realtime Database for shared state ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, set, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyB_Fltl9ZqCVN8ALBG2DhxBl5K-CBJsqAc",
  authDomain: "lp-dashboard-7f594.firebaseapp.com",
  databaseURL: "https://lp-dashboard-7f594-default-rtdb.firebaseio.com",
  projectId: "lp-dashboard-7f594",
  storageBucket: "lp-dashboard-7f594.firebasestorage.app",
  messagingSenderId: "958023898598",
  appId: "1:958023898598:web:7b588be850aa53cbc83227"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const stateRef = ref(db, 'candidate_status');

// Local cache of state synced from Firebase
let localState = {};
const TOTAL_CANDIDATES = 141;

// Migration map: old UIDs (without location) → new UIDs (with location)
const UID_MIGRATION = {"a_431873_BlankRome_InvestmentManagementAss_NewYorkCity": "a_431873_BlankRome_InvestmentManagementAssociat_NewYorkCity_20260216", "a_371915_BlankRome_InvestmentManagementAss_NewYorkCity": "a_371915_BlankRome_InvestmentManagementAssociat_NewYorkCity_20260216", "a_337966_BlankRome_InvestmentManagementAss_NewYorkCity": "a_337966_BlankRome_InvestmentManagementAssociat_NewYorkCity_20260216", "a_406398_BlankRome_InvestmentManagementAss_NewYorkCity": "a_406398_BlankRome_InvestmentManagementAssociat_NewYorkCity_20260216", "a_431873_FriedFrank_AssetManagementAssociat_DistrictofCol": "a_431873_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_371915_FriedFrank_AssetManagementAssociat_DistrictofCol": "a_371915_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_478757_FriedFrank_AssetManagementAssociat_DistrictofCol": "a_478757_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_405711_FriedFrank_AssetManagementAssociat_DistrictofCol": "a_405711_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_406398_FriedFrank_AssetManagementAssociat_DistrictofCol": "a_406398_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_337966_FriedFrank_AssetManagementAssociat_DistrictofCol": "a_337966_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_340894_FriedFrank_AssetManagementAssociat_DistrictofCol": "a_340894_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_339797_GreenbergTraur_CapitalMarketsAssociate_NewYorkCity": "a_339797_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_20260209", "a_369523_GreenbergTraur_CapitalMarketsAssociate_NewYorkCity": "a_369523_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_20260209", "m_369523_GreenbergTraur_CapitalMarketsAssociate_NewYorkCity": "m_369523_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_02092026", "a_376527_GreenbergTraur_CapitalMarketsAssociate_NewYorkCity": "a_376527_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_20260209", "a_340894_GreenbergTraur_CapitalMarketsAssociate_NewYorkCity": "a_340894_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_20260209", "a_399909_GreenbergTraur_CapitalMarketsAssociate_NewYorkCity": "a_399909_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_20260209", "a_462900_TroutmanPepper_TransactionalRealEstate_AtlantaGeorgi": "a_462900_TroutmanPepper_TransactionalRealEstateAsso_AtlantaGeorgi_20251029", "a_361307_WinstonStraw_NewYorkOfficeEnergy_NewYorkCity": "a_361307_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_20260128", "a_361307_WinstonStraw_NewYorkOfficeStructu_NewYorkCity": "a_361307_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_293746_WinstonStraw_NewYorkOfficeEnergy_NewYorkCity": "a_293746_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_20260128", "a_466086_WinstonStraw_NewYorkOfficeEnergy_NewYorkCity": "a_466086_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_20260128", "a_441668_WinstonStraw_NewYorkOfficeStructu_NewYorkCity": "a_441668_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260219", "a_405452_WinstonStraw_NewYorkOfficeStructu_NewYorkCity": "a_405452_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_369516_WinstonStraw_NewYorkOfficeStructu_NewYorkCity": "a_369516_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_436297_WinstonStraw_NewYorkOfficeStructu_NewYorkCity": "a_436297_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_525825_WinstonStraw_NewYorkOfficeStructu_NewYorkCity": "a_525825_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_307884_WinstonStraw_NewYorkOfficeStructu_NewYorkCity": "a_307884_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "m_429161_BallardSpahrL_LaborandEmploymentLiti_LosAngelesCa": "m_429161_BallardSpahr_LaborandEmploymentLitigatio_LosAngelesCa_11252025", "m_429161_DLAPiper_SeniorEmploymentAssocia_LosAngelesCa": "m_429161_DLAPiper_SeniorEmploymentAssociateor_LosAngelesCa_01072026", "m_428436_DLAPiper_SeniorEmploymentAssocia_LosAngelesCa": "m_428436_DLAPiper_SeniorEmploymentAssociateor_LosAngelesCa_01072026", "m_453490_FriedFrankH_RealEstateSeniorAssoci_DistrictofCol": "m_453490_FriedFrank_RealEstateSeniorAssociate_DistrictofCol_05092025", "m_410512_GreenbergTraur_CapitalMarketsAssociate_NewYorkCity": "m_410512_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_02092026", "m_481801_GreenbergTraur_CapitalMarketsAssociate_NewYorkCity": "m_481801_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_02092026", "m_405894_GreenbergTraur_CapitalMarketsAssociate_NewYorkCity": "m_405894_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_02092026", "m_514852_GreenbergTraur_LaborEmploymentAssoci_SacramentoCal": "m_514852_GreenbergTraur_LaborEmploymentAssociate_SacramentoCal_02242026", "m_307882_HollandKnigh_RealEstateCapitalMarke_NewYorkCity": "m_307882_HollandKnigh_RealEstateCapitalMarketsFi_NewYorkCity_06202025", "m_449240_HollandKnigh_RealEstateCapitalMarke_NewYorkCity": "m_449240_HollandKnigh_RealEstateCapitalMarketsFi_NewYorkCity_06202025", "m_453490_HollandKnigh_RealEstateCapitalMarke_NewYorkCity": "m_453490_HollandKnigh_RealEstateCapitalMarketsFi_NewYorkCity_06202025", "m_453490_HollandKnigh_RealEstateTransactions_NewYorkCity": "m_453490_HollandKnigh_RealEstateTransactionsAssoc_NewYorkCity_01072026", "m_350004_HollandKnigh_RealEstateCapitalMarke_NewYorkCity": "m_350004_HollandKnigh_RealEstateCapitalMarketsFi_NewYorkCity_06202025", "m_506632_HollandKnigh_RealEstateTransactions_NewYorkCity": "m_506632_HollandKnigh_RealEstateTransactionsAssoc_NewYorkCity_01072026", "m_534056_HollandKnigh_RealEstateTransactions_NewYorkCity": "m_534056_HollandKnigh_RealEstateTransactionsAssoc_NewYorkCity_01072026", "m_491346_HollandKnigh_MidLevelHealthcareReg_NashvilleTenn": "m_491346_HollandKnigh_MidLevelHealthcareRegEn_NashvilleTenn_03032026", "m_522505_LittlerMendels_LosAngelesLaborEmp_LosAngelesCa": "m_522505_LittlerMendels_LosAngelesLaborEmployme_LosAngelesCa_01012026", "m_405711_McGuireWoodsLL_HealthcareAssociateFD_NewYorkCity": "m_405711_McGuireWoods_HealthcareAssociateFDAL_NewYorkCity_03052026", "m_525764_McGuireWoodsLL_LaborEmploymentMidle_LosAngelesCa": "m_525764_McGuireWoods_LaborEmploymentMidlevelA_LosAngelesCa_11062025", "m_565673_McGuireWoodsLL_LaborEmploymentMidle_LosAngelesCa": "m_565673_McGuireWoods_LaborEmploymentMidlevelA_LosAngelesCa_11062025", "m_370811_PillsburyWinth_AssociateMA_NewYorkCity": "m_370811_Pillsbury_AssociateMA_NewYorkCity_05212025", "m_469954_ReedSmithLLP_SanFranciscoLaborE_SanFrancisco": "m_469954_ReedSmith_SanFranciscoLaborEmploy_SanFrancisco_02202026", "m_469175_SeyfarthShawL_LaborandEmploymentAsso_LosAngelesCa": "m_469175_Seyfarth_LaborandEmploymentAssociate_LosAngelesCa_02042026", "m_469175_SeyfarthShawL_2026LaborandEmployment_LosAngelesCa": "m_469175_Seyfarth_2026LaborandEmploymentAsso_LosAngelesCa_01062026", "m_428436_SeyfarthShawL_LaborandEmploymentAsso_LosAngelesCa": "m_428436_Seyfarth_LaborandEmploymentAssociate_LosAngelesCa_02042026", "m_428436_SeyfarthShawL_2026LaborandEmployment_LosAngelesCa": "m_428436_Seyfarth_2026LaborandEmploymentAsso_LosAngelesCa_01062026", "m_485600_WinstonStraw_NewYorkOfficeEnergy_NewYorkCity": "m_485600_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_01282026", "m_462887_WinstonStraw_NewYorkOfficeEnergy_NewYorkCity": "m_462887_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_01282026", "m_649069_WinstonStraw_NewYorkOfficeEnergy_NewYorkCity": "m_649069_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_01282026", "a_431873_BlankRome_InvestmentManagementAssociat": "a_431873_BlankRome_InvestmentManagementAssociat_NewYorkCity_20260216", "a_371915_BlankRome_InvestmentManagementAssociat": "a_371915_BlankRome_InvestmentManagementAssociat_NewYorkCity_20260216", "a_337966_BlankRome_InvestmentManagementAssociat": "a_337966_BlankRome_InvestmentManagementAssociat_NewYorkCity_20260216", "a_406398_BlankRome_InvestmentManagementAssociat": "a_406398_BlankRome_InvestmentManagementAssociat_NewYorkCity_20260216", "a_431873_FriedFrank_AssetManagementAssociate": "a_431873_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_371915_FriedFrank_AssetManagementAssociate": "a_371915_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_478757_FriedFrank_AssetManagementAssociate": "a_478757_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_405711_FriedFrank_AssetManagementAssociate": "a_405711_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_337966_FriedFrank_AssetManagementAssociate": "a_337966_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_406398_FriedFrank_AssetManagementAssociate": "a_406398_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_340894_FriedFrank_AssetManagementAssociate": "a_340894_FriedFrank_AssetManagementAssociate_DistrictofCol_20260202", "a_475996_GreenbergTraur_EnvironmentalAssociateMid": "a_475996_GreenbergTraur_EnvironmentalAssociateMid_DenverColorad_20260219", "a_339797_GreenbergTraur_CapitalMarketsAssociateMid": "a_339797_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_20260209", "a_369523_GreenbergTraur_CapitalMarketsAssociateMid": "a_369523_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_20260209", "a_376527_GreenbergTraur_CapitalMarketsAssociateMid": "a_376527_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_20260209", "a_399909_GreenbergTraur_CapitalMarketsAssociateMid": "a_399909_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_20260209", "a_340894_GreenbergTraur_CapitalMarketsAssociateMid": "a_340894_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_20260209", "a_462900_TroutmanPepper_TransactionalRealEstateAsso": "a_462900_TroutmanPepper_TransactionalRealEstateAsso_AtlantaGeorgi_20251029", "a_361307_WinstonStraw_NewYorkOfficeStructuredF": "a_361307_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_405452_WinstonStraw_NewYorkOfficeStructuredF": "a_405452_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_436297_WinstonStraw_NewYorkOfficeStructuredF": "a_436297_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_441668_WinstonStraw_NewYorkOfficeStructuredF": "a_441668_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260219", "a_369516_WinstonStraw_NewYorkOfficeStructuredF": "a_369516_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_525825_WinstonStraw_NewYorkOfficeStructuredF": "a_525825_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_307884_WinstonStraw_NewYorkOfficeStructuredF": "a_307884_WinstonStraw_NewYorkOfficeStructuredF_NewYorkCity_20260204", "a_361307_WinstonStraw_NewYorkOfficeEnergyandI": "a_361307_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_20260128", "a_466086_WinstonStraw_NewYorkOfficeEnergyandI": "a_466086_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_20260128", "a_293746_WinstonStraw_NewYorkOfficeEnergyandI": "a_293746_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_20260128", "m_405711_McGuireWoods_HealthcareAssociateFDAL": "m_405711_McGuireWoods_HealthcareAssociateFDAL_NewYorkCity_03052026", "m_525764_McGuireWoods_LaborEmploymentMidlevelA": "m_525764_McGuireWoods_LaborEmploymentMidlevelA_LosAngelesCa_11062025", "m_565673_McGuireWoods_LaborEmploymentMidlevelA": "m_565673_McGuireWoods_LaborEmploymentMidlevelA_LosAngelesCa_11062025", "m_493816_Cooley_LitigationAttorney5th7thy": "m_493816_Cooley_LitigationAttorney5th7thy_SiliconValley_02052026", "m_525822_Cooley_CapitalMarketsSecurities": "m_525822_Cooley_CapitalMarketsSecurities_SanFrancisco_12112025", "m_522398_Cooley_CapitalMarketsSecurities": "m_522398_Cooley_CapitalMarketsSecurities_SanFrancisco_12112025", "m_406328_Cooley_CapitalMarketsSecurities": "m_406328_Cooley_CapitalMarketsSecurities_SanFrancisco_12112025", "m_481801_Cooley_CapitalMarketsAttorney3rd": "m_481801_Cooley_CapitalMarketsAttorney3rd_NewYorkCity_11192025", "m_405894_Cooley_CapitalMarketsAttorney3rd": "m_405894_Cooley_CapitalMarketsAttorney3rd_NewYorkCity_11192025", "m_436086_Cooley_CapitalMarketsAttorney3rd": "m_436086_Cooley_CapitalMarketsAttorney3rd_NewYorkCity_11192025", "m_576239_Cooley_CapitalMarketsAttorney3rd": "m_576239_Cooley_CapitalMarketsAttorney3rd_NewYorkCity_11192025", "m_521435_Cooley_IPLitigationITEngineering": "m_521435_Cooley_IPLitigationITEngineering_SiliconValley_01272025", "m_521435_Cooley_IPLitigationLifeSciencesA": "m_521435_Cooley_IPLitigationLifeSciencesA_SiliconValley_01272025", "m_458939_Cooley_CyberDataPrivacyAttorney4": "m_458939_Cooley_CyberDataPrivacyAttorney4_NewYorkCity_11212023", "m_490208_Cooley_CyberDataPrivacyAttorney4": "m_490208_Cooley_CyberDataPrivacyAttorney4_ChicagoIllino_11212023", "m_514852_GreenbergTraur_LaborEmploymentAssociate": "m_514852_GreenbergTraur_LaborEmploymentAssociate_SacramentoCal_02242026", "m_410512_GreenbergTraur_CapitalMarketsAssociateMid": "m_410512_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_02092026", "m_481801_GreenbergTraur_CapitalMarketsAssociateMid": "m_481801_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_02092026", "m_369523_GreenbergTraur_CapitalMarketsAssociateMid": "m_369523_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_02092026", "m_405894_GreenbergTraur_CapitalMarketsAssociateMid": "m_405894_GreenbergTraur_CapitalMarketsAssociateMid_NewYorkCity_02092026", "m_407005_GreenbergTraur_RealEstateAssociateCHI": "m_407005_GreenbergTraur_RealEstateAssociateCHI_ChicagoIllino_09252025", "m_572121_GreenbergTraur_RealEstateAssociateLosAn": "m_572121_GreenbergTraur_RealEstateAssociateLosAn_LosAngelesCa_05202025", "m_525822_Goodwin_TechCapitalMarketsMidlevel": "m_525822_Goodwin_TechCapitalMarketsMidlevel_SanFrancisco_12092025", "m_430488_Goodwin_PrivateEquityDebtFinanceS": "m_430488_Goodwin_PrivateEquityDebtFinanceS_NewYorkCity_09122025", "m_541425_Goodwin_TechnologyCompaniesMidLev": "m_541425_Goodwin_TechnologyCompaniesMidLev_SanFrancisco_07302025", "m_522398_Goodwin_TechnologyCompaniesMidLev": "m_522398_Goodwin_TechnologyCompaniesMidLev_SanFrancisco_07302025", "m_432416_Goodwin_TechnologyCompaniesMidLev": "m_432416_Goodwin_TechnologyCompaniesMidLev_SanFrancisco_07302025", "m_466261_Goodwin_TechnologyCompaniesMidLev": "m_466261_Goodwin_TechnologyCompaniesMidLev_SanFrancisco_07302025", "m_525822_Goodwin_TechnologyCompaniesMidLev": "m_525822_Goodwin_TechnologyCompaniesMidLev_SanFrancisco_07302025", "m_534115_Goodwin_PrivateEquityMAAssetMana": "m_534115_Goodwin_PrivateEquityMAAssetMana_NewYorkCity_07252025", "m_319095_Goodwin_PrivateEquityMAAssetMana": "m_319095_Goodwin_PrivateEquityMAAssetMana_NewYorkCity_07252025", "m_405711_Goodwin_PrivateEquityMAAssetMana": "m_405711_Goodwin_PrivateEquityMAAssetMana_NewYorkCity_07252025", "m_498964_Goodwin_PrivateEquityMAAssetMana": "m_498964_Goodwin_PrivateEquityMAAssetMana_NewYorkCity_07252025", "m_370981_Goodwin_PrivateEquityMAAssetMana": "m_370981_Goodwin_PrivateEquityMAAssetMana_NewYorkCity_07252025", "m_405711_Goodwin_PrivateEquityInvestmentFund": "m_405711_Goodwin_PrivateEquityInvestmentFund_NewYorkCity_07142025", "m_343416_Goodwin_PrivateEquityInvestmentFund": "m_343416_Goodwin_PrivateEquityInvestmentFund_NewYorkCity_07142025", "m_525822_Goodwin_PrivateEquityInvestmentFund": "m_525822_Goodwin_PrivateEquityInvestmentFund_SanFrancisco_07142025", "m_465457_Goodwin_TechnologyCompaniesCorporate": "m_465457_Goodwin_TechnologyCompaniesCorporate_NewYorkCity_07092025", "m_469795_Goodwin_TechnologyCompaniesCorporate": "m_469795_Goodwin_TechnologyCompaniesCorporate_NewYorkCity_07092025", "m_534115_Goodwin_TechnologyCompaniesCorporate": "m_534115_Goodwin_TechnologyCompaniesCorporate_NewYorkCity_07092025", "m_347144_Goodwin_TechnologyCompaniesCorporate": "m_347144_Goodwin_TechnologyCompaniesCorporate_BostonMassach_07092025", "m_481801_Goodwin_LifeSciencesCorporateMid": "m_481801_Goodwin_LifeSciencesCorporateMid_NewYorkCity_05202025", "m_576239_Goodwin_LifeSciencesCorporateMid": "m_576239_Goodwin_LifeSciencesCorporateMid_NewYorkCity_05202025", "m_525822_Goodwin_LifeSciencesCorporateMid": "m_525822_Goodwin_LifeSciencesCorporateMid_SanFrancisco_05202025", "m_371829_Dechert_LaborandEmploymentAssociate": "m_371829_Dechert_LaborandEmploymentAssociate_NewYorkCity_02242026", "m_441695_Dechert_LaborandEmploymentAssociate": "m_441695_Dechert_LaborandEmploymentAssociate_NewYorkCity_02242026", "m_469954_Dechert_LaborandEmploymentAssociate": "m_469954_Dechert_LaborandEmploymentAssociate_SanFrancisco_02242026", "m_525348_Dechert_LaborandEmploymentAssociate": "m_525348_Dechert_LaborandEmploymentAssociate_SanFrancisco_02242026", "m_369369_Dechert_CybersecurityPrivacyAIAs": "m_369369_Dechert_CybersecurityPrivacyAIAs_SanFrancisco_02102026", "m_449240_Dechert_FundFinanceSubscriptionLine": "m_449240_Dechert_FundFinanceSubscriptionLine_NewYorkCity_04222025", "m_429161_DLAPiper_SeniorEmploymentAssociateor": "m_429161_DLAPiper_SeniorEmploymentAssociateor_LosAngelesCa_01072026", "m_428436_DLAPiper_SeniorEmploymentAssociateor": "m_428436_DLAPiper_SeniorEmploymentAssociateor_LosAngelesCa_01072026", "m_481801_Sidley_CapitalMarketsAssociate": "m_481801_Sidley_CapitalMarketsAssociate_NewYorkCity_03092026", "m_369523_Sidley_CapitalMarketsAssociate": "m_369523_Sidley_CapitalMarketsAssociate_NewYorkCity_03092026", "m_436086_Sidley_CapitalMarketsAssociate": "m_436086_Sidley_CapitalMarketsAssociate_NewYorkCity_03092026", "m_405894_Sidley_CapitalMarketsAssociate": "m_405894_Sidley_CapitalMarketsAssociate_NewYorkCity_03092026", "m_576239_Sidley_CapitalMarketsAssociate": "m_576239_Sidley_CapitalMarketsAssociate_NewYorkCity_03092026", "m_506632_Sidley_RealEstateAssociate": "m_506632_Sidley_RealEstateAssociate_NewYorkCity_02042026", "m_356854_Sidley_RealEstateAssociate": "m_356854_Sidley_RealEstateAssociate_NewYorkCity_02042026", "m_357918_Sidley_RealEstateAssociate": "m_357918_Sidley_RealEstateAssociate_NewYorkCity_02042026", "m_534056_Sidley_RealEstateAssociate": "m_534056_Sidley_RealEstateAssociate_NewYorkCity_02042026", "m_558979_Sidley_RealEstateAssociate": "m_558979_Sidley_RealEstateAssociate_NewYorkCity_02042026", "m_267295_Sidley_GlobalFinanceLeveragedFin": "m_267295_Sidley_GlobalFinanceLeveragedFin_ChicagoIllino_12242025", "m_522505_LittlerMendels_LosAngelesLaborEmployme": "m_522505_LittlerMendels_LosAngelesLaborEmployme_LosAngelesCa_01012026", "m_576239_Dentons_CapitalMarketsAssociateNe": "m_576239_Dentons_CapitalMarketsAssociateNe_NewYorkCity_01262026", "m_462887_WinstonStraw_NewYorkOfficeEnergyandI": "m_462887_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_01282026", "m_485600_WinstonStraw_NewYorkOfficeEnergyandI": "m_485600_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_01282026", "m_649069_WinstonStraw_NewYorkOfficeEnergyandI": "m_649069_WinstonStraw_NewYorkOfficeEnergyandI_NewYorkCity_01282026", "m_491346_HollandKnigh_MidLevelHealthcareRegEn": "m_491346_HollandKnigh_MidLevelHealthcareRegEn_NashvilleTenn_03032026", "m_439905_HollandKnigh_RealEstateFinanceAssociate": "m_439905_HollandKnigh_RealEstateFinanceAssociate_AtlantaGeorgi_02112026", "m_506632_HollandKnigh_RealEstateTransactionsAssoc": "m_506632_HollandKnigh_RealEstateTransactionsAssoc_NewYorkCity_01072026", "m_453490_HollandKnigh_RealEstateTransactionsAssoc": "m_453490_HollandKnigh_RealEstateTransactionsAssoc_NewYorkCity_01072026", "m_534056_HollandKnigh_RealEstateTransactionsAssoc": "m_534056_HollandKnigh_RealEstateTransactionsAssoc_NewYorkCity_01072026", "m_558979_HollandKnigh_RealEstateTransactionsAssoc": "m_558979_HollandKnigh_RealEstateTransactionsAssoc_NewYorkCity_01072026", "m_614618_HollandKnigh_RealEstateTransactionsAssoc": "m_614618_HollandKnigh_RealEstateTransactionsAssoc_NewYorkCity_01072026", "m_307882_HollandKnigh_RealEstateCapitalMarketsFi": "m_307882_HollandKnigh_RealEstateCapitalMarketsFi_NewYorkCity_06202025", "m_449240_HollandKnigh_RealEstateCapitalMarketsFi": "m_449240_HollandKnigh_RealEstateCapitalMarketsFi_NewYorkCity_06202025", "m_453490_HollandKnigh_RealEstateCapitalMarketsFi": "m_453490_HollandKnigh_RealEstateCapitalMarketsFi_NewYorkCity_06202025", "m_350004_HollandKnigh_RealEstateCapitalMarketsFi": "m_350004_HollandKnigh_RealEstateCapitalMarketsFi_NewYorkCity_06202025", "m_354214_HoganLovells_InvestigationsWhiteCollar": "m_354214_HoganLovells_InvestigationsWhiteCollar_LosAngelesCa_09222025", "m_469954_ReedSmith_SanFranciscoLaborEmploy": "m_469954_ReedSmith_SanFranciscoLaborEmploy_SanFrancisco_02202026", "m_429161_BallardSpahr_LaborandEmploymentLitigatio": "m_429161_BallardSpahr_LaborandEmploymentLitigatio_LosAngelesCa_11252025", "m_449240_CadwaladerWic_FundFinanceAssociateNewYor": "m_449240_CadwaladerWic_FundFinanceAssociateNewYor_NewYorkCity_03032026", "m_371829_SheppardMullin_LaborEmploymentAssociate": "m_371829_SheppardMullin_LaborEmploymentAssociate_NewYorkCity_02032026", "m_441695_SheppardMullin_LaborEmploymentAssociate": "m_441695_SheppardMullin_LaborEmploymentAssociate_NewYorkCity_02032026", "m_343416_WillkieFarr_AssetManagementAssociateRe": "m_343416_WillkieFarr_AssetManagementAssociateRe_DistrictofCol_02092026", "m_528415_WillkieFarr_AntitrustAssociate": "m_528415_WillkieFarr_AntitrustAssociate_NewYorkCity_02032026", "m_559243_WillkieFarr_AntitrustAssociate": "m_559243_WillkieFarr_AntitrustAssociate_NewYorkCity_02032026", "m_453490_FriedFrank_RealEstateSeniorAssociate": "m_453490_FriedFrank_RealEstateSeniorAssociate_DistrictofCol_05092025", "m_521823_HuntonAndrews_LosAngelesLaborandEmploy": "m_521823_HuntonAndrews_LosAngelesLaborandEmploy_LosAngelesCa_01222026", "m_469175_Seyfarth_LaborandEmploymentAssociate": "m_469175_Seyfarth_LaborandEmploymentAssociate_LosAngelesCa_02042026", "m_428436_Seyfarth_LaborandEmploymentAssociate": "m_428436_Seyfarth_LaborandEmploymentAssociate_LosAngelesCa_02042026", "m_469175_Seyfarth_2026LaborandEmploymentAsso": "m_469175_Seyfarth_2026LaborandEmploymentAsso_LosAngelesCa_01062026", "m_428436_Seyfarth_2026LaborandEmploymentAsso": "m_428436_Seyfarth_2026LaborandEmploymentAsso_LosAngelesCa_01062026", "m_525822_Pillsbury_AssociateCorporateSecurit": "m_525822_Pillsbury_AssociateCorporateSecurit_SiliconValley_12092025", "m_541425_Pillsbury_AssociateCorporateSecurit": "m_541425_Pillsbury_AssociateCorporateSecurit_SiliconValley_12092025", "m_432416_Pillsbury_AssociateCorporateSecurit": "m_432416_Pillsbury_AssociateCorporateSecurit_SiliconValley_12092025", "m_466261_Pillsbury_AssociateCorporateSecurit": "m_466261_Pillsbury_AssociateCorporateSecurit_SiliconValley_12092025", "m_370811_Pillsbury_AssociateMA": "m_370811_Pillsbury_AssociateMA_NewYorkCity_05212025", "m_504374_Pillsbury_AssociateMA": "m_504374_Pillsbury_AssociateMA_NewYorkCity_05212025"};
let migrationDone = false;

// Listen for realtime changes from Firebase
onValue(stateRef, (snapshot) => {
  localState = snapshot.val() || {};

  // One-time migration: move old UID entries to new UID format
  if (!migrationDone) {
    migrationDone = true;
    let didMigrate = false;
    for (const [oldKey, data] of Object.entries(localState)) {
      const oldUid = data.uid || oldKey;
      if (UID_MIGRATION[oldUid]) {
        const newUid = UID_MIGRATION[oldUid];
        const newFbKey = newUid.replace(/[^a-zA-Z0-9_]/g,'_');
        // Only migrate if new key doesn't already exist
        if (!localState[newFbKey]) {
          data.uid = newUid;
          set(ref(db, 'candidate_status/' + newFbKey), data);
          remove(ref(db, 'candidate_status/' + oldKey));
          didMigrate = true;
        }
      }
    }
    if (didMigrate) return; // onValue will fire again after migration writes
  }

  // Build maps for cross-job awareness:
  // 1. By fp_id (same person within same data source)
  // 2. By candidate name (same person across Ari + Manu tabs)
  const sentByFpId = {};
  const sentByName = {};
  for (const [fbKey, data] of Object.entries(localState)) {
    if (data.status === 'sent' && data.uid) {
      const row = document.getElementById('row-' + data.uid);
      const fpId = row ? row.dataset.fpid : '';
      const name = (data.candidateName || (row ? row.dataset.candidateName : '') || '').toLowerCase().trim();
      const firm = data.hiringFirm || (row ? row.dataset.hiringFirm : '') || '?';
      const entry = { hiringFirm: firm, date: data.date || '?', uid: data.uid };
      if (fpId) {
        if (!sentByFpId[fpId]) sentByFpId[fpId] = [];
        sentByFpId[fpId].push(entry);
      }
      if (name) {
        if (!sentByName[name]) sentByName[name] = [];
        sentByName[name].push(entry);
      }
    }
  }

  // Apply all statuses to the DOM
  document.querySelectorAll('.cand-row').forEach(row => {
    const uid = row.dataset.uid;
    if (!uid) return;
    const data = localState[uid.replace(/[^a-zA-Z0-9_]/g,'_')];
    applyStatusDOM(uid, data ? data.status : null);

    // Cross-job awareness: check if this person was sent for a DIFFERENT job
    // Match by fp_id (same source) OR by name (cross Ari/Manu tabs)
    const fpId = row.dataset.fpid;
    const candName = (row.dataset.candidateName || '').toLowerCase().trim();
    const xjobBadge = document.getElementById('xjob-' + uid);
    row.classList.remove('cross-job-warned');
    if (xjobBadge) { xjobBadge.textContent = ''; xjobBadge.style.background = ''; }

    // Collect all sends for this person from both maps, deduplicate by uid
    const allSends = {};
    if (fpId && sentByFpId[fpId]) {
      for (const s of sentByFpId[fpId]) allSends[s.uid] = s;
    }
    if (candName && sentByName[candName]) {
      for (const s of sentByName[candName]) allSends[s.uid] = s;
    }
    const otherSends = Object.values(allSends).filter(s => s.uid !== uid);
    if (otherSends.length > 0 && !(data && (data.status === 'sent' || data.status === 'skip'))) {
      const warns = otherSends.map(s => s.hiringFirm + ' (' + s.date + ')').join(', ');
      row.classList.add('cross-job-warned');
      if (xjobBadge) {
        xjobBadge.textContent = 'Offered to: ' + warns;
        xjobBadge.style.background = '#fed7aa';
        xjobBadge.style.color = '#9a3412';
      }
    }
  });
  updateCounts();
});

window.markStatus = function(uid, status) {
  const fbKey = uid.replace(/[^a-zA-Z0-9_]/g,'_');
  // Get hiring firm from the row's data attribute
  const row = document.getElementById('row-' + uid);
  const hiringFirm = row ? row.dataset.hiringFirm : '';
  const candidateName = row ? row.dataset.candidateName : '';
  if (status) {
    set(ref(db, 'candidate_status/' + fbKey), {
      status: status,
      date: new Date().toISOString().slice(0,10),
      uid: uid,
      hiringFirm: hiringFirm,
      candidateName: candidateName
    });
  } else {
    remove(ref(db, 'candidate_status/' + fbKey));
  }
  toast(status === 'sent' ? 'Marked as sent' : status === 'skip' ? 'Skipped' : 'Restored');
};

function applyStatusDOM(uid, status) {
  const row = document.getElementById('row-' + uid);
  if (!row) return;
  row.classList.remove('status-sent', 'status-skip');
  const badge = document.getElementById('badge-' + uid);
  const fbKey = uid.replace(/[^a-zA-Z0-9_]/g,'_');
  const data = localState[fbKey];
  const dateStr = data && data.date ? ' · ' + data.date : '';
  if (status === 'sent') {
    row.classList.add('status-sent');
    if (badge) { badge.textContent = 'SENT' + dateStr; badge.style.background = '#dcfce7'; badge.style.color = '#166534'; }
  } else if (status === 'skip') {
    row.classList.add('status-skip');
    if (badge) { badge.textContent = 'SKIPPED' + dateStr; badge.style.background = '#fef3c7'; badge.style.color = '#92400e'; }
  } else {
    if (badge) { badge.textContent = ''; badge.style.background = ''; }
  }
}

function updateCounts() {
  const entries = Object.values(localState);
  const sent = entries.filter(e => e.status === 'sent').length;
  const skipped = entries.filter(e => e.status === 'skip').length;
  const el = document.getElementById('actionCount');
  if (el) el.textContent = sent + ' sent · ' + skipped + ' skipped · ' + (TOTAL_CANDIDATES - sent - skipped) + ' remaining';
}

window.toggleHide = function() {
  const hide = document.getElementById('hideActioned').checked;
  document.querySelectorAll('.tab-pane').forEach(p => {
    if (hide) p.classList.add('hide-actioned');
    else p.classList.remove('hide-actioned');
  });
};

window.filterByDate = function(val) {
  const panes = document.querySelectorAll('.tab-pane');
  if (!val) {
    panes.forEach(p => p.classList.remove('date-filter-active'));
    document.querySelectorAll('.cand-row').forEach(r => r.classList.remove('date-match'));
    return;
  }
  const now = new Date();
  const todayStr = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  const yest = new Date(now); yest.setDate(yest.getDate()-1);
  const yestStr = yest.getFullYear()+'-'+String(yest.getMonth()+1).padStart(2,'0')+'-'+String(yest.getDate()).padStart(2,'0');
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate()-7);
  const weekStr = weekAgo.getFullYear()+'-'+String(weekAgo.getMonth()+1).padStart(2,'0')+'-'+String(weekAgo.getDate()).padStart(2,'0');

  document.querySelectorAll('.cand-row').forEach(r => {
    const added = r.dataset.dateAdded || '';
    let match = false;
    if (val === 'today') match = (added === todayStr);
    else if (val === 'yesterday') match = (added === yestStr);
    else if (val === 'week') match = (added >= weekStr);
    r.classList.toggle('date-match', match);
  });
  panes.forEach(p => p.classList.add('date-filter-active'));
};

window.sw = function(t){
  document.querySelectorAll('.tab').forEach((el,i)=>el.classList.toggle('active',(t==='ari'&&i===0)||(t==='manu'&&i===1)));
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  document.getElementById('p-'+t).classList.add('active');
};
window.filt = function(t,q){
  const lq=q.toLowerCase();
  document.getElementById('f-'+t).querySelectorAll('.firm-section').forEach(s=>{
    s.style.display=s.textContent.toLowerCase().includes(lq)?'':'none';
  });
};
window.copyMsg = function(m){
  navigator.clipboard.writeText(m).then(()=>toast('Copied!')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=m;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Copied!');
  });
};
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}

window.exportFeedback = function() {
  // Bundle feedback + status data into a single export file for the daily model run
  const exportData = {
    exported: new Date().toISOString(),
    feedback: feedbackState,
    statuses: localState
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lp_feedback.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('Feedback exported — save to your Downloads folder');
};

// --- Feedback system ---
const feedbackRef = ref(db, 'candidate_feedback');
let feedbackState = {};

onValue(feedbackRef, (snapshot) => {
  feedbackState = snapshot.val() || {};
  // Render existing feedback on all open panels
  document.querySelectorAll('.fb-panel').forEach(panel => {
    const uid = panel.id.replace('fb-panel-','');
    renderFeedbackNotes(uid);
  });
});

function renderFeedbackNotes(uid) {
  const container = document.getElementById('fb-existing-' + uid);
  if (!container) return;
  const fbKey = uid.replace(/[^a-zA-Z0-9_]/g,'_');
  const notes = feedbackState[fbKey];
  if (!notes || !notes.entries || notes.entries.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = notes.entries.map(n =>
    '<div class="fb-note"><div class="fb-meta">' + (n.date||'') + '</div>' + (n.text||'').replace(/</g,'&lt;') + '</div>'
  ).join('');
}

window.toggleFeedback = function(uid) {
  const panel = document.getElementById('fb-panel-' + uid);
  if (!panel) return;
  const show = panel.style.display === 'none';
  panel.style.display = show ? 'block' : 'none';
  if (show) renderFeedbackNotes(uid);
};

window.submitFeedback = function(uid) {
  const input = document.getElementById('fb-input-' + uid);
  if (!input || !input.value.trim()) return;
  const fbKey = uid.replace(/[^a-zA-Z0-9_]/g,'_');
  const row = document.getElementById('row-' + uid);
  const candidateName = row ? row.dataset.candidateName : '';
  const hiringFirm = row ? row.dataset.hiringFirm : '';
  const existing = feedbackState[fbKey] || { entries: [] };
  existing.entries = existing.entries || [];
  existing.entries.push({
    text: input.value.trim(),
    date: new Date().toISOString().slice(0,10),
    candidateName: candidateName,
    hiringFirm: hiringFirm,
    uid: uid
  });
  existing.candidateName = candidateName;
  existing.hiringFirm = hiringFirm;
  existing.uid = uid;
  set(ref(db, 'candidate_feedback/' + fbKey), existing);
  input.value = '';
  toast('Feedback saved');
};

// Default: hide sent/skipped on load
document.getElementById('hideActioned').checked = true;
toggleHide();
