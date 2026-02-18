import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";

const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border py-12 mt-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-gradient-brand flex items-center justify-center">
              <span className="font-bold text-xs text-primary-foreground">B</span>
            </div>
            <span className="text-base font-semibold">
              branding<span className="text-gradient">.tn</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/builder" className="hover:text-foreground transition-colors">{t("footer.services")}</Link>
            <Link to="/auth" className="hover:text-foreground transition-colors">{t("footer.signIn")}</Link>
            <span>{t("footer.copyright")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
