const tour = {
  id: "fluree-tour",
  steps: [
    {
      title: "Create a New Ledger",
      content: "Click on this button if you want to create a new ledger.",
      target: "#new-database-button",
      placement: "top",
    },
    {
      title: "Ledger Selection",
      content:
        "All your available ledgers will appear in this dropdown. Here, you can select a ledger to query.",
      target: "#database-dropdown",
      placement: "right",
      fixed: true,
      onNext: function () {
        window.location =
          'flureeql?query={%0D%20"select":["*"],%0D%20"from":%20"_collection"%0D%20}';
      },
    },
    {
      title: "FlureeQL",
      content:
        "The FlureeQL page allows you to query and transact the ledger with the FlureeQL JSON syntax.",
      target: "#fluree-nav",
      placement: "right",
      fixed: true,
    },
    {
      title: "Query Your Collections",
      content:
        'In order to submit a query, you need to select the query button, and then press the "play" button.',
      target: "#query-button",
      placement: "left",
    },
    {
      title: "Query Your Collections",
      content:
        "This query lets you see all your collections, which are analagous to database tables.",
      target: "#flureeql",
      placement: "left",
    },
    {
      title: "Visiting the Docs",
      content:
        "To learn more, follow along with the Quick Start guide in the Docs!",
      target: "#docs-nav",
      placement: "top",
      fixed: true,
      ctaLabel: "To Quickstart",
      showCTAButton: true,
      onCTA: function () {
        window.open("https://docs.flur.ee/#quick-start", "_blank");
      },
    },
  ],
};

export default tour;
