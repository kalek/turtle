import React, { Component } from "react";
import axios from "axios";
import cheerio from "cheerio";
import { each } from "lodash";
import "./App.css";

const AMOUNT_NUMBERS = 10;
const instruments = [
  "alr",
  "ccc",
  "cdr",
  "cps",
  "dnp",
  "jsw",
  "kgh",
  "lpp",
  "lts",
  "mbk",
  "opl",
  "peo",
  "pge",
  "pgn",
  "pkn",
  "pko",
  "ply",
  "pzu",
  "spl",
  "tpe"
];
let COUNTER = 0;

class App extends Component {
  state = {
    data: null
  };
  async componentDidMount() {
    const dataTmp = [];

    instruments.forEach(async (instrument, index) => {
      const resp = await axios.get(`https://stooq.pl/q/d/?s=${instrument}`);
      const htmlResp = resp.data;
      const $instrument = cheerio.load(htmlResp);
      const tmpInstrument = $instrument("#fth1 tbody tr");
      if (index === 0) {
        each(tmpInstrument, item => {
          dataTmp.push({
            date: item.children[1].children[0].data,
            [instrument]: item.children[5].children[0].data
          });
        });
        COUNTER = COUNTER + 1;
      } else {
        each(tmpInstrument, (item, index) => {
          dataTmp[index][instrument] = item.children[5].children[0].data;
        });
        COUNTER = COUNTER + 1;
      }
      if (COUNTER === instruments.length) {
        this.setState({ data: dataTmp });
      }
    });
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
    const { data } = this.state;
    return (
      <div className="app">
        {data && (
          <table cellPadding="0" cellSpacing="0" border="0">
            <tr>
              <td>Data</td>
              {instruments.map(instrument => (
                <td>{instrument}</td>
              ))}
            </tr>
            {data.map((item, index) => {
              return (
                <tr>
                  <td>{item.date}</td>
                  {instruments.map(instrument => (
                    <td className={this.getClass(instrument, index, item)}>
                      {item[instrument]}
                    </td>
                  ))}
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
