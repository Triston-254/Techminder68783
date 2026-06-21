import LegalDialog from './LegalDialog';

function LandingLegalSection({ page, activeSection, onClose }) {
  return (
    <>
      <LegalDialog
        title={page.footerPrivacy}
        updated={page.legalLastUpdated}
        sections={page.privacySections}
        open={activeSection === 'privacy'}
        onClose={onClose}
        closeLabel={page.legalClose}
      />
      <LegalDialog
        title={page.footerTerms}
        updated={page.legalLastUpdated}
        sections={page.termsSections}
        open={activeSection === 'terms'}
        onClose={onClose}
        closeLabel={page.legalClose}
      />
    </>
  );
}

export default LandingLegalSection;
