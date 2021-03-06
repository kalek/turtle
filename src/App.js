import React, { Component } from "react";
import axios from "axios";
import cheerio from "cheerio";
import moment from "moment";
import { each } from "lodash";
import "./App.css";

const AMOUNT_NUMBERS = 10;
const WIG20 = [
  "ALIOR-BANK",
  "CCC",
  "CD-PROJEKT",
  "CYFROWY-POLSAT",
  "DNP",
  "JSW-JASTRZEBSKA-SPOLKA-WEGLOWA",
  "KGHM",
  "LPP",
  "LOTOS",
  "MBANK",
  "ORANGE",
  "PEKAO",
  "PGE",
  "PGNIG",
  "PKN-ORLEN",
  "PKO",
  "PLY",
  "PZU",
  "SPL",
  "TAURON"
];

const MWIG40 = [
  "11-BIT-STUDIOS",
  "ASSECO-POLAND",
  "AMICA",
  "ATT",
  "BUDIMEX",
  "BENEFIT-SYSTEMS",
  "BANK-HANDLOWY",
  "BNP",
  "BORYSZEW",
  "INTER-CARS",
  "CIECH",
  "CI-GAMES",
  "CLNPHARMA",
  "COMARCH",
  "DVL",
  "EAT",
  "ECHO-INVESTMENT",
  "ENEA",
  "ENERGA",
  "EUROCASH",
  "FAMUR",
  "FORTE",
  "GPW",
  "GTC",
  "GETIN-HOLDING",
  "ING-BANK-SLASKI",
  "KERNEL",
  "KRUK",
  "KETY",
  "LIVECHAT",
  "BOGDANKA",
  "MABION",
  "BANK-MILLENNIUM",
  "ORBIS",
  "PKPCARGO",
  "PLAYWAY",
  "STALPRODUKT",
  "TEN",
  "VRG",
  "WIRTUALNA-POLSKA"
];

const SWIG80 = [
  "ATAL",
  "ABE",
  "ASSECO-BUSINESS-SOLUTIONS",
  "ACG",
  "AGORA",
  "ALTUS",
  "AMBRA",
  "ALUMETAL",
  "APR",
  "APATOR",
  "ARH",
  "ASBISC",
  "ASSECO-SOUTH-EASTERN-EUROPE",
  "ASTARTA",
  "ATM-GRUPA",
  "BAHOLDING",
  "BIOTON",
  "BKM",
  "BANK-OCHRONY-SRODOWISKA",
  "BSC-DRUKARNIA-OPAKOWAN",
  "COMP",
  "COGNOR",
  "CAPITAL-PARK",
  "CORMAY",
  "DAT",
  "DEBICA",
  "DOM-DEVELOPMENT",
  "EKO-EXPORT",
  "ELEKTROBUDOWA",
  "ELEMENTAL-HOLDING",
  "ENT",
  "FERRO",
  "IDEA-BANK",
  "INDUSTRIAL-MILK-COMPANY",
  "INSTAL-KRAKOW",
  "KOGENERACJA",
  "KRUSZWICA",
  "LENTEX",
  "MCI",
  "MEDICALGORITHMICS",
  "MGT",
  "MLP-GROUP",
  "MENNICA-POLSKA",
  "MONNARI-TRADE",
  "NETIA",
  "NEUCA",
  "NEWAG",
  "OAT",
  "OPONEO-PL",
  "OVOSTAR",
  "PEKABEX",
  "POLICE",
  "ROKITA",
  "PRAIRIE-MINING-LIMITED",
  "POLENERGIA",
  "POLSKI-HOLDING-NIERUCHOMOSCI",
  "POLNORD",
  "PGS-SOFTWARE",
  "POLIMEX",
  "R22",
  "RAINBOW-TOURS",
  "RAFAKO",
  "RVU",
  "SEN",
  "SNIEZKA",
  "SLV",
  "STOMIL-SANOK",
  "SYNEKTIK",
  "STALEXPORT-AUTOSTRADY",
  "TIM",
  "TOYA",
  "TORPOL",
  "TRAKCJA",
  "UNIMOT-GAZ",
  "VIGO-SYSTEM",
  "VOXEL",
  "VIVID-GAMES",
  "WIELTON",
  "WAWEL",
  "ZEPAK"
];

const initialInstruments = {
  activeCard1: [],
  activeCard2: [],
  activeCard3: [],
  activeCard4: WIG20,
  activeCard5: MWIG40,
  activeCard6: SWIG80
};

class App extends Component {
  state = {
    data: null,
    activeCard: 1,
    instruments:
      JSON.parse(localStorage.getItem("instruments")) || initialInstruments,
    inputValue: ""
  };
  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeCard } = this.state;
    if (activeCard !== prevState.activeCard) {
      this.loadData();
    }
  }

  async loadData() {
    const { activeCard, instruments } = this.state;
    const dataTmp = [];
    const data = JSON.parse(localStorage.getItem(`activeCard${activeCard}`));
    const day = moment().date();
    let COUNTER = 0;

    if (data && data.day >= day) {
      this.setState({ data: data.data });
    } else {
      if (instruments[`activeCard${activeCard}`].length) {
        instruments[`activeCard${activeCard}`].forEach(
          async (instrument, index) => {
            const resp = await axios.get(
              `https://www.biznesradar.pl/notowania-historyczne/${instrument}`
            );
            const htmlResp = resp.data;
            const $instrument = cheerio.load(htmlResp);
            const tmpInstrument = $instrument(".qTableFull tbody tr");
            if (COUNTER === 0) {
              each(tmpInstrument, (item, index) => {
                dataTmp.push({
                  date: item.children[1].children[0].data,
                  [instrument]: item.children[9].children[0].data
                });
              });
              COUNTER = COUNTER + 1;
            } else {
              each(tmpInstrument, (item, index) => {
                dataTmp[index][instrument] = item.children[9].children[0].data;
              });
              COUNTER = COUNTER + 1;
            }
            if (COUNTER === instruments[`activeCard${activeCard}`].length) {
              localStorage.setItem(
                `activeCard${activeCard}`,
                JSON.stringify({ day: day, data: dataTmp })
              );
              this.setState({ data: dataTmp });
            }
          }
        );
      } else {
        this.setState({ data: null });
      }
    }
  }
  getClass = (name, index, item) => {
    const { data } = this.state;
    if (index >= data.length - (AMOUNT_NUMBERS - 1)) {
      return "grey";
    } else {
      const lastItems = data.slice(index + 1, index + AMOUNT_NUMBERS + 1);
      const lastNumbers = [];
      lastItems.forEach(item => {
        lastNumbers.push(parseFloat(item[name]));
      });
      const maxNumber = Math.max.apply(Math, lastNumbers);
      const minNumber = Math.min.apply(Math, lastNumbers);
      if (parseFloat(item[name]) > maxNumber) {
        return "buy";
      }
      if (parseFloat(item[name]) < minNumber) {
        return "sell";
      }
    }
  };
  render() {
    const { data, instruments, activeCard, inputValue } = this.state;

    return (
      <div className="app">
        <div className="header">
          <ul className="list-cards">
            <li
              className={activeCard === 1 ? "active" : null}
              onClick={() => this.setState({ activeCard: 1 })}
            >
              KARTA 1
            </li>
            <li
              className={activeCard === 2 ? "active" : null}
              onClick={() => this.setState({ activeCard: 2 })}
            >
              KARTA 2
            </li>
            <li
              className={activeCard === 3 ? "active" : null}
              onClick={() => this.setState({ activeCard: 3 })}
            >
              KARTA 3
            </li>
            <li
              className={activeCard === 4 ? "active" : null}
              onClick={() => this.setState({ activeCard: 4 })}
            >
              WIG20
            </li>
            <li
              className={activeCard === 5 ? "active" : null}
              onClick={() => this.setState({ activeCard: 5 })}
            >
              MWIG40
            </li>
            <li
              className={activeCard === 6 ? "active" : null}
              onClick={() => this.setState({ activeCard: 6 })}
            >
              SWIG80
            </li>
          </ul>
          <div className="add-button">
            Dodaj symbol:
            <input
              type="text"
              value={inputValue}
              onChange={e => this.setState({ inputValue: e.target.value })}
            ></input>
            <div
              onClick={() => {
                setTimeout(async () => {
                  const instrumentsTmp = Object.assign({}, instruments);
                  instrumentsTmp[`activeCard${activeCard}`].push(inputValue);
                  this.setState({
                    inputValue: "",
                    instruments: instrumentsTmp
                  });
                  localStorage.setItem(
                    "instruments",
                    JSON.stringify(instrumentsTmp)
                  );
                  if (!data) {
                    this.loadData();
                  } else {
                    const resp = await axios.get(
                      `https://www.biznesradar.pl/notowania-historyczne/${inputValue}`
                    );
                    const htmlResp = resp.data;
                    const $instrument = cheerio.load(htmlResp);
                    const tmpInstrument = $instrument(".qTableFull tbody tr");
                    const dataTmp = Object.assign([], data);
                    each(tmpInstrument, (item, index) => {
                      dataTmp[index][inputValue] =
                        item.children[9].children[0].data;
                    });
                    const day = moment().date();
                    localStorage.setItem(
                      `activeCard${activeCard}`,
                      JSON.stringify({ day: day, data: dataTmp })
                    );
                    this.setState({ data: dataTmp });
                  }
                }, 100);
              }}
              className="add-symbol"
            >
              DODAJ
            </div>
          </div>
        </div>
        {data && Boolean(data.length) && (
          <table cellPadding="0" cellSpacing="0" border="0">
            <tr>
              {Object.keys(data[0]).map(item => (
                <td>{item}</td>
              ))}
            </tr>
            {data.map((item, index) => {
              if (index === 0) {
                return null;
              }
              return (
                <tr>
                  {Object.keys(item).map(itemKey => {
                    if (itemKey === "date") {
                      return <td>{item[itemKey]}</td>;
                    } else {
                      return (
                        <td className={this.getClass(itemKey, index, item)}>
                          {item[itemKey]}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          </table>
        )}
      </div>
    );
  }
}

export default App;
