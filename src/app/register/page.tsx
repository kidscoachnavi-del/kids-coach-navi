import { redirect } from 'next/navigation';

/**
 * 登録ページ (/register) への直接アクセスを正規の認定コーチ登録導線へリダイレクトする。
 * 保護者・生徒は会員登録不要の都度予約制のため、サービス上の新規登録フローは /coach/onboarding に統一している。
 */
export default function RegisterRedirectPage() {
  redirect('/coach/onboarding');
}
