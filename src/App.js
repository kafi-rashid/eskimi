import React, { Component } from 'react';
import Moment from 'moment';
import './App.css';

class App extends Component {
	constructor() {
		super();
		this.state = {
      initData: {},
      results: [],
      loaded: false,
      perPage: 10,
      curPage: 1,
      curRow: null,
      showDetails: false,
      selDate: '',
      selHT: '',
      selVT: '',
      selHTS: '',
      selVTS: '',
      selSsn: '2018',
      selSts: 'Final',
      totalPage: 0,
      totalCount: 0,
      sortBy: '',
      sortAsc: true
    }
    this.compareBy.bind(this);
    this.sortBy.bind(this);
  }
  
  fetchData(curPage, perPage) {
    this.setState({
      results: [],
      loaded: false
    })
    fetch('https://free-nba.p.rapidapi.com/games?page='+curPage+'&per_page='+perPage, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': 'free-nba.p.rapidapi.com',
        'X-RapidAPI-Key': 'a3394d4d01mshcb6f136ddf42827p1a62a8jsnfaeb957e6986'
			}
		}).then((response) => response.json())
		.then((responseData) => {
      this.setState({
        initData: responseData.data,
        totalPage: responseData.meta.total_pages,
        totalCount: responseData.meta.total_count
      });
      Object.keys(responseData.data).map((key, index) => {
        this.state.results.push({
          id: this.state.initData[key].id,
          date: this.state.initData[key].date,
          htn: this.state.initData[key].home_team.full_name,
          vtn: this.state.initData[key].visitor_team.full_name,
          hts: this.state.initData[key].home_team_score,
          vts: this.state.initData[key].visitor_team_score,
          season: this.state.initData[key].season,
          htc: this.state.initData[key].home_team.conference,
          vtc: this.state.initData[key].visitor_team.conference,
          status: this.state.initData[key].status
        });
      })
      this.setState({
        loaded: true
      })
		}).catch((error) => { });
  }

  componentDidMount() {
    this.fetchData(0, 10)
  }

  viewDetails = (id, date, htn, vtn, hts, vts, ssn, sts) => {
    this.setState({ 
      curRow: id,
      selDate: date,
      selHT: htn,
      selVT: vtn,
      selHTS: hts,
      selVTS: vts,
      selSsn: ssn,
      selSts: sts,
      showDetails: true
    })
  }

  nextPage = () => {
    this.setState({ curPage: this.state.curPage + 1 })
    this.fetchData(this.state.curPage, 10)
  }

  prevPage = () => {
    this.setState({ curPage: this.state.curPage - 1 })
    this.fetchData(this.state.curPage, 10)
  }

  goToPage = (no) => {
    this.setState({ curPage: no })
    this.fetchData(this.state.curPage, 10)
  }

  showAll = () => {
    alert('The number of total row is '+this.state.totalCount+' but due to API usage limitation maximum 100 rows can be viewed at a time.');
    this.setState({ curPage: null, perPage: this.state.total_count })
    this.fetchData(0, this.state.totalCount)
  }

  compareBy(key) {
    if (this.state.sortAsc) {
      return function (a, b) {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      }
    }
    else {
      return function (a, b) {
        if (a[key] > b[key]) return -1;
        if (a[key] < b[key]) return 1;
        return 0;
      }
    }
  }
 
  sortBy(key) {
    let arrayCopy = [...this.state.results];
    arrayCopy.sort(this.compareBy(key));
    this.setState({ 
      results: arrayCopy,
      sortBy: key,
      sortAsc: this.state.sortBy === key && !this.state.sortAsc
    });
  }
  
  renderPage() {
    let num = []
    for(let i = (this.state.curPage <= 5 ? 1 : this.state.curPage - 4); i < (this.state.curPage <= 5 ? 10 : this.state.curPage + 5); i++) {
      num.push(<button onClick={ () => this.goToPage(i) } className={ this.state.curPage === i && 'selected-page' }>{ i }</button>)
    }
    return num;
  }

  render() {
    const DataRow = (props) => 
    <tr onClick={ () => this.viewDetails(props.id, props.date, props.home_team_full_name, props.visitor_team_full_name, props.home_team_score, props.visitor_team_score, props.season, props.status) } key={ props.index } className={( props.id === this.state.curRow ? 'selected-row' : '' )}>
      <td>{ Moment(props.date).format('D MMM Y') }</td>
      <td>{ props.home_team_full_name }</td>
      <td>{ props.visitor_team_full_name }</td>
      <td>{ (props.home_team_score > props.visitor_team_score) ? props.home_team_full_name : props.visitor_team_full_name }</td>
      <td>{ props.home_team_score + ' - ' + props.visitor_team_score }</td>
    </tr>;
    const DataHead = (props) =>
    <td onClick={ () => this.sortBy(props.sortID) } className={  props.sortID === 'winner' ? 'no-select' : '' }>
      { props.headTitle } { props.sortID === this.state.sortBy && ( this.state.sortAsc ? '↑' : '↓' ) }
    </td>;

    return (
      <div className="container">
        <div className="data">
          <div className={ !this.state.showDetails ? 'data-table-full' : 'data-table' }>
            <div className="header">
              <a href="">
                <img src={ require('./images/logo.png') } alt="nba-logo" />
                <div className="header-titles">
                  <p className="title">NBA</p>
                  <p className="slogan">Conference Standings</p>
                </div>
                </a>
              </div>
            <table>
              <thead>
                <tr>
                  <DataHead headTitle="Date" sortID="date"/>
                  <DataHead headTitle="Home Team" sortID="htn"/>
                  <DataHead headTitle="Visiting Team" sortID="vtn"/>
                  <DataHead headTitle="Winner" sortID="winner"/>
                  <DataHead headTitle="Score" sortID="hts"/>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.loaded ? 
                  this.state.results.map((item, i) => (
                      <DataRow key={ i } index={ i } id={ item.id } date={ item.date } home_team_full_name={ item.htn } visitor_team_full_name={ item.vtn } home_team_score={ item.hts } visitor_team_score={ item.vts } season={ item.season } status={ item.status } />
                  ))
                  :
                  <div className="loader">
                    <img src={ require('./images/loader.gif') } alt="loader"/>
                  </div>
                }
              </tbody>
            </table>
            <div className={ "pagination "+ (this.state.loaded ? '' : 'disabled') }>
              <button onClick={ this.prevPage } className={ "no-border " + (this.state.curPage === 1 ? 'disabled' : '') }>← Prev</button>
              { this.renderPage() }
              <button onClick={ this.nextPage } className={ "no-border " + (this.state.curPage === this.state.totalPage ? 'disabled' : '') }>Next →</button>
              <button onClick={ this.showAll } className={ "no-border " + (this.state.curPage === this.state.totalPage ? 'disabled' : '') }>All</button>
            </div>
          </div>
          {
            this.state.showDetails &&
            <div className="info">
              <p className="info-title">{ this.state.selSsn } NBA</p>
              <p className="info-status">{ this.state.selSts }</p>
              <br/>
              <p className="info-date">{ Moment(this.state.selDate).format('D MMM Y') }</p>
              <p className="info-team">{ this.state.selHT }</p>
              <div className="spacer"></div>
              <p className="info-score">{ this.state.selHTS } { this.state.selHTS > this.state.selVTS && <img className="trophy" src={ require('./images/trophy.png') } /> }</p>
              <div className="info-separator"></div>
              <p className="info-score">{ this.state.selVTS } { this.state.selVTS > this.state.selHTS && <img className="trophy" src={ require('./images/trophy.png') } /> }</p>
              <div className="spacer"></div>
              <p className="info-team">{ this.state.selVT }</p>
            </div>
          }
        </div>
        <p className="cred">Developed for Eskimi as Initial Task by Saidul Islam</p>
      </div>
    );
  }
}

export default App;