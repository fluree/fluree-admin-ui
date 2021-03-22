import React, { useEffect, useState } from "react";
import { flureeVersion } from '../flureeFetch';

interface Props {
  adminUIVersion: string
}

function Footer(props: Props) {
  const [ledgerVersion, setLedgerVersion] = useState("")

  useEffect(() => {
    const fetchVersion = async () => {
      const version = await flureeVersion()
      if (version) {
        console.log(`Setting ledgerVersion to ${ledgerVersion}`)
        setLedgerVersion(version)
      }
    }
    fetchVersion()
  }, [ledgerVersion, setLedgerVersion])

  return (
    <div className="m40 text-center border-top-gray">
      <ul
        className="nav nav-pills mt10"
        style={{
          display: "flex",
          justifyContent: "center",
          color: "#091133",
        }}
      >
        <li role="presentation">
          <a
            style={{ color: "#091133" }}
            href="https://docs.flur.ee"
            rel="noopener noreferrer"
            target="_blank"
            className="small strong text-muted"
          >
            Documentation
          </a>
        </li>
        <li role="presentation">
          <a
            style={{ color: "#091133" }}
            href="mailto:support@flur.ee"
            className="small strong text-muted"
          >
            Contact
          </a>
        </li>
        <li>
          <a
            style={{ color: "#091133" }}
            className="small strong text-muted"
            href="https://launchpass.com/flureedb"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-slack" />
            &nbsp;Fluree Slack
          </a>{" "}
        </li>
      </ul>
      <div className="small" style={{ color: "#091133" }}>
        { ledgerVersion && `Fluree Ledger ${ledgerVersion }` } <br />
        { props.adminUIVersion && `Fluree Admin UI ${props.adminUIVersion}` } <br />
        <a
          style={{ color: "#091133" }}
          href="https://flur.ee/agreements/FlureeEnterpriseTermsofService.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms
        </a>
        &nbsp;+&nbsp;
        <a
          style={{ color: "#091133" }}
          href="https://flur.ee/wp-content/uploads/2020/07/Fluree-Privacy-Policy-6-20.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy
        </a>
        &nbsp;© Fluree, PBC
      </div>
    </div>
  )
}

export default Footer;
