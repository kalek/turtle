import React, { Component } from "react";
import axios from "axios";
import cheerio from "cheerio";
import { each } from "lodash";
import "./App.css";

const AMOUNT_NUMBERS = 10;

class App extends Component {
  state = {
    data: null
  };
  async componentDidMount() {
    const dataTmp = [];
    // KAWA
    const respCoffee = await axios.get("https://stooq.pl/q/d/?s=kc.f");
    const htmlCoffee = respCoffee.data;
    const $coffee = cheerio.load(htmlCoffee);
    const tmpCoffee = $coffee("#fth1 tbody tr");
    each(tmpCoffee, item => {
      dataTmp.push({
        date: item.children[1].children[0].data,
        priceCoffee: item.children[5].children[0].data
      });
    });

    // WIG
    const respWig = await axios.get("https://stooq.pl/q/d/?s=wig20");
    const htmlWig = respWig.data;
    const $wig = cheerio.load(htmlWig);
    const tmpWig = $wig("#fth1 tbody tr");
    each(tmpWig, (item, index) => {
      dataTmp[index].priceWig = item.children[5].children[0].data;
    });

    // DAX
    const respDax = await axios.get("https://stooq.pl/q/d/?s=^dax");
    const htmlDax = respDax.data;
    const $dax = cheerio.load(htmlDax);
    const tmpDax = $dax("#fth1 tbody tr");
    each(tmpDax, (item, index) => {
      dataTmp[index].priceDax = item.children[5].children[0].data;
    });

    // OIL
    const respOil = await axios.get("https://stooq.pl/q/d/?s=cl.f");
    const htmlOil = respOil.data;
    const $oil = cheerio.load(htmlOil);
    const tmpOil = $oil("#fth1 tbody tr");
    each(tmpOil, (item, index) => {
      dataTmp[index].priceOil = item.children[5].children[0].data;
    });

    // GOLD
    const respGold = await axios.get("https://stooq.pl/q/d/?s=xauusd");
    const htmlGold = respGold.data;
    const $Gold = cheerio.load(htmlGold);
    const tmpGold = $Gold("#fth1 tbody tr");
    each(tmpGold, (item, index) => {
      dataTmp[index].priceGold = item.children[5].children[0].data;
    });

    // EURUSD
    const respEurUsd = await axios.get("https://stooq.pl/q/d/?s=eurusd");
    const htmlEurUsd = respEurUsd.data;
    const $EurUsd = cheerio.load(htmlEurUsd);
    const tmpEurUsd = $EurUsd("#fth1 tbody tr");
    each(tmpEurUsd, (item, index) => {
      dataTmp[index].priceEurUsd = item.children[5].children[0].data;
    });

    // EURUSD
    const respsp500 = await axios.get("https://stooq.pl/q/d/?s=^spx");
    const htmlsp500 = respsp500.data;
    const $sp500 = cheerio.load(htmlsp500);
    const tmpsp500 = $sp500("#fth1 tbody tr");
    each(tmpsp500, (item, index) => {
      dataTmp[index].pricesp500 = item.children[5].children[0].data;
    });

    // SAVE DATA
    this.setState({ data: dataTmp });
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
              <td>KAWA</td>
              <td>WIG</td>
              <td>DAX</td>
              <td>OIL</td>
              <td>GOLD</td>
              <td>EURUSD</td>
              <td>SP500</td>
            </tr>
            {data.map((item, index) => {
              return (
                <tr>
                  <td>{item.date}</td>
                  <td className={this.getClass("priceCoffee", index, item)}>
                    {item.priceCoffee}
                  </td>
                  <td className={this.getClass("priceWig", index, item)}>
                    {item.priceWig}
                  </td>
                  <td className={this.getClass("priceDax", index, item)}>
                    {item.priceDax}
                  </td>
                  <td className={this.getClass("priceOil", index, item)}>
                    {item.priceOil}
                  </td>
                  <td className={this.getClass("priceGold", index, item)}>
                    {item.priceGold}
                  </td>
                  <td className={this.getClass("priceEurUsd", index, item)}>
                    {item.priceEurUsd}
                  </td>
                  <td className={this.getClass("pricesp500", index, item)}>
                    {item.pricesp500}
                  </td>
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
