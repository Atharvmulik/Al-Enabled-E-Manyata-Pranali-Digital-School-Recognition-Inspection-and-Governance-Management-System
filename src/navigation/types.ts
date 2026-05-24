import { NavigatorScreenParams } from '@react-navigation/native';

// Main Tab Navigator Params
export type MainTabParamList = {
  Dashboard: undefined;
  Inspections: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// Root Stack Navigator Params
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  InspectionDetails: { inspectionId: string };
  DocumentVerification: { inspectionId: string };
  InspectionMode: { inspectionId: string };
  EvidenceUpload: { inspectionId: string };
  FinalReport: { inspectionId: string };
  EditProfile: undefined;
  Certificate: { inspection_id: string };
  VerifyCertificate: { certificate_id: string };
};

// Inspection Stack Navigator Params (if needed)
export type InspectionStackParamList = {
  InspectionList: undefined;
  InspectionDetails: { inspectionId: string };
  DocumentVerification: { inspectionId: string };
  InspectionMode: { inspectionId: string };
  EvidenceUpload: { inspectionId: string };
  FinalReport: { inspectionId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
