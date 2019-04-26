import React from "react";
import axios from "axios";
import { Button, Badge, Pagination, PaginationItem, PaginationLink, InputGroup, InputGroupText, InputGroupAddon, Input, Progress } from 'reactstrap';
import { Link } from "react-router-dom";
import queryString from "query-string";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt, faSearch } from "@fortawesome/free-solid-svg-icons";

import ModalConfirm from "../ModalConfirm/ModalConfirm";
import "./EntityList.css";

library.add(faEdit, faTrashAlt, faSearch);

class EntityList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listEntities: [],
            metadata: null,
            tableHead: ["name", "short description", "poster", "views", "durations", "type", "published", "actions"],
            isModalConfirmDeleteOpened: false,
            isModalConfirmDeleteSingleOpened: false,
            isModalConfirmPublishOpened: false,
            searchKeyword: "",
            modalConfirmNote: "",
            entitiesIsChecked: [],
            entityWillBeDeleted: null,
            showPublishProgress: false,
            publishProgress: 0
        }
    }

    componentDidMount() {
        let entitySearchBox = document.getElementById("entity-searchbox");
        let searchQuery = queryString.parse(this.props.location.search);
        if(searchQuery.keyword !== undefined) {
            this.retreiveSearchListEntities(this.props.location.search);
            entitySearchBox.value = searchQuery.keyword;
        }
        else
            this.retreiveListEntities();
    }

    shouldComponentUpdate(nextProps) {
        if(this.props.location !== nextProps.location) {
            let checkboxAllEntites = document.getElementById("check-all-entities");
            if(checkboxAllEntites.checked) {
                checkboxAllEntites.click();
            }
            let searchQuery = queryString.parse(nextProps.location.search);
            if(searchQuery.keyword !== undefined) {
                this.retreiveSearchListEntities(nextProps.location.search);
            }
            else{
                this.retreiveListEntities(nextProps.location.search);
            }
        }
        return this.props === nextProps;
    }

    retreiveListEntities = async (searchQuery = null) => {
        if(searchQuery === null) {
            searchQuery = this.props.location.search;
        }
        try {
            const res = await axios.get(`/media/entity${searchQuery}`);

            const { data, metadata, code } = res.data;
            
            if(code === 200) {
                this.setState({
                    listEntities: data,
                    metadata
                });
            }
        }
        catch(err) {
            throw new Error(err);
        }
    }

    retreiveSearchListEntities = async searchQuery => {
        try {
            let res = await axios.get(`/media/entity/search${searchQuery}`);
            let { data, metadata } = res.data;

            this.setState({
                listEntities: data,
                metadata
            })

        }
        catch(err) {
            throw new Error(err);
        }
    }

    showTableHeader = () => {
        const { tableHead } = this.state;

        return tableHead.map((head, index) => <th key={index}>{head}</th>)
    }

    showListEntities = () => {
        const { listEntities } = this.state;

        return listEntities.map( (entity, index) => {
            let publishStatusClass = entity.publishToCdn === "success" ? "success" : null;
            return (
                <tr key={index} className="row-entity">
                    <td><input type="checkbox" name={entity.id} className="checkbox-entity" onChange={e => this.handleClickEachEntityCheckbox(e, entity.id)}/></td>
                    <td className="col-entity-name"><Link to={`/entity/${entity.id}`}>{entity.name}</Link></td>
                    <td>{entity.shortDescription}</td>
                    <td><img className="entity-poster" src={entity.poster ? entity.poster : "/assets/img/image-not-available.jpg"}/></td>
                    <td>{entity.view}</td>
                    <td>{entity.duration}</td>
                    <td>{entity.type}</td>
                    <td><Badge className={publishStatusClass} data-id={entity.id}>{entity.publishToCdn}</Badge></td>
                    <td>
                        <Link to={`/entity/${entity.id}`}><FontAwesomeIcon icon={faEdit}/></Link>{' '}
                        <FontAwesomeIcon icon={faTrashAlt} onClick={() => this.toggleModalDeleteSingleConfirmation(entity.id)}/>
                    </td>
                </tr>
            )
        });
    }

    renderPagination = () => {
        if(this.state.metadata) {
            const { total, limit } = this.state.metadata;
            let paginationPage = [];
            if(total/limit > 1) {
                let searchQuery = queryString.parse(this.props.location.search);
                console.log(searchQuery);
                for(let i = 1; i < total/limit + 1; i++) {
                    paginationPage.push(i);
                }
                
                return paginationPage.map((page, index) => {
                    let nextPath = `/entity?limit=5&page=${page}`;
                    if(searchQuery.keyword !== undefined) {
                        nextPath += `&keyword=${searchQuery.keyword}`;
                    }
                    return (
                            <PaginationItem key={index}> 
                                <Link to={nextPath} className="page-link">
                                    {page}
                                </Link>
                            </PaginationItem>
                    )
                })
            }
        }
    }

    debounced(func, wait) {
        let timeout;
        
        return function() {
            let context = this,
                args = arguments;
            
            let executeFunction = function() {
                func.apply(context, args);
            }

            clearTimeout(timeout);
            timeout = setTimeout(executeFunction, wait);
        }
    }

    handleOnChangeSearchEntities = this.debounced(event =>{
        let searchKeyword = event.target.value.trim();

        if(searchKeyword.length > 0) {
            this.props.history.push(`/entity?limit=5&page=1&keyword=${searchKeyword}`);
            this.callSearchEntityApi(searchKeyword);
        }
        else {
            this.props.history.push(`/entity?limit=5&page=1`);
            this.retreiveListEntities();
        }
    }, 1500);

    callSearchEntityApi = async keyword => {
        try {
            let res = await axios.get(`/media/entity/search?keyword=${keyword}&limit=5&page=1`);
            let { data, metadata } = res.data;

            this.setState({
                listEntities: data,
                metadata
            })

        }
        catch(err) {
            throw new Error(err);
        }
    }

    handleClickCheckBoxAllEntities = event => {
        let entityCheckBoxs = document.getElementsByClassName("checkbox-entity");
        let entitiesIsChecked = [];
        let checkAllEntitiesStatus = event.target.checked;

        for(let i = 0; i < entityCheckBoxs.length; i++) {
            entityCheckBoxs[i].checked = checkAllEntitiesStatus;
            if(checkAllEntitiesStatus) {
                entitiesIsChecked.push(entityCheckBoxs[i].name);
            }
        }

        this.setState({
            entitiesIsChecked
        });
    }

    handleClickEachEntityCheckbox = (event, entityId) => {
        let { entitiesIsChecked } = this.state;

        if(event.target.checked) {
            entitiesIsChecked.push(entityId);
        }
        else {
            entitiesIsChecked = entitiesIsChecked.filter(entity => entity !== entityId);
        }

        this.setState({
            entitiesIsChecked
        });
    }

    toggleModalDeleteConfirmation = () => {
        let { entitiesIsChecked } = this.state;
        let modalConfirmNote = `Do you want to delete ${entitiesIsChecked.length} entity?`;

        if(entitiesIsChecked.length > 0) {
            this.setState({
                isModalConfirmDeleteOpened: !this.state.isModalConfirmDeleteOpened,
                modalConfirmNote
            });
        }
        else {
            console.log("Check at least one entity");
        }
    }

    toggleModalDeleteSingleConfirmation = (entityId = null) => {
        let modalConfirmNote = `Do you want to delete entity?`;
        this.setState({
            isModalConfirmDeleteSingleOpened: !this.state.isModalConfirmDeleteSingleOpened,
            modalConfirmNote,
            entityWillBeDeleted: entityId
        });
    }

    toggleModalPublishConfirmation = () => {
        let { entitiesIsChecked } = this.state;
        let modalConfirmNote = `Do you want to publish ${entitiesIsChecked.length} entity?`;

        if(entitiesIsChecked.length === 1) {
            this.setState({
                isModalConfirmPublishOpened: !this.state.isModalConfirmPublishOpened,
                modalConfirmNote
            });
        }
        else if(entitiesIsChecked.length === 0) {
            console.log("Check at least one entity");
        }
        else {
            console.log("Just publish one entity at once");
        }
    }

    resetCheckboxStateAfterConfirm = () => {
        let checkboxElements = document.getElementsByClassName("checkbox-entity");

        console.log(checkboxElements)

        for(let checkbox of checkboxElements) {
            checkbox.checked = false;
        }
    }

    callDeleteEntityApi = async entityId => {
        try {
            let res = await axios.delete("/media/entity", { data: { id: entityId } });
            let { code } = res.data;

            if(code === 200 ) {
                this.retreiveListEntities();
            }
        }
        catch(err) {
            throw new Error(err);
        }
    }

    deleteMultiEntities = () => {
        let { entitiesIsChecked } = this.state;

        this.resetCheckboxStateAfterConfirm();
        if(entitiesIsChecked.length > 0) {
            entitiesIsChecked.map(entity => {
                this.callDeleteEntityApi(entity);
            });
            this.toggleModalDeleteConfirmation();
        }
        else {
            console.log("Check at least one entity");
        }
    }

    callPublishEntityApi = async () => {
        const { entitiesIsChecked } = this.state;
        const entityId = entitiesIsChecked[0];

        // let entityElement = document.querySelector(`span[data-id="${entityId}"]`)
        // entityElement.innerHTML = "initializing";

        if(entitiesIsChecked.length === 1) {
            try {
                let res = await axios.post("/media/entity/publish", { id: entityId });
                let { code } = res.data;
    
                if(code === 200) {
                    // entityElement.innerHTML = "success";
                    // entityElement.style.backgroundColor = "green";
                    this.setState({ showPublishProgress: true });
                    this.watchPublishProgress(entityId);
                }
            }
            catch(err) {
                // entityElement.innerHTML = "not-ready";
                throw new Error(err);
            }
        }
        else if(entitiesIsChecked.length === 0){
            console.log("Check one entity");
        }
        else {
            console.log("Just pubish one entity at once");
        }
    }

    showPublishProgressBar = () => {
        const { publishProgress } = this.state;
        return (
            <Progress value={publishProgress} max="100" />
        )
    }

    watchPublishProgress = entityId => {
        let intervalProgress = setInterval(async () => {
            try {
                let res = await axios.get(`/media/entity/publish/status?id=${entityId}`);
                let { code, data } = res.data;

                if(code === 200) {
                    if(data.progress === 100) {
                        this.setState({ isModalConfirmPublishOpened: false, publishProgress: 0 });
                        clearInterval(intervalProgress);
                    }

                    this.setState({
                        publishProgress: data.progress
                    });
                }
            }
            catch(err) {
                throw new Error(err);
            }
        }, 5000)
    }

    render() {
        const { isModalConfirmDeleteOpened, isModalConfirmPublishOpened, isModalConfirmDeleteSingleOpened, modalConfirmNote, entityWillBeDeleted, showPublishProgress } = this.state;

        return (
            <>
                <div className="entity-list">
                    <div className="control-panel">
                        <div className="panel-filter">
                            <InputGroup>
                                <Input type="text" className="entity-searchbox" id="entity-searchbox" onChange={e => {e.persist(); this.handleOnChangeSearchEntities(e)}}/>
                                <InputGroupAddon addonType="append">
                                <InputGroupText><FontAwesomeIcon icon={faSearch}/></InputGroupText>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                        <div className="panel-actions">
                            <Link to="/entity/create" className="button">Create new Entity</Link>
                            <Button color="info" className="button" onClick={ () => this.toggleModalPublishConfirmation() }>Publish</Button>
                            <Button color="danger" className="button" onClick={ () => this.toggleModalDeleteConfirmation() }>Delete</Button>
                        </div>
                    </div>
                    <div className="list-table">
                        <table>
                            <thead>
                                <tr>
                                    <th><input type="checkbox" id="check-all-entities" onClick={this.handleClickCheckBoxAllEntities} /></th>
                                    { this.showTableHeader() }
                                </tr>
                            </thead>
                            <tbody>
                                { this.showListEntities() }
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination aria-label="Page navigation example">
                    <PaginationItem>
                    <PaginationLink previous href="#" />
                    </PaginationItem>
                        {this.renderPagination()}
                    <PaginationItem>
                        <PaginationLink next href="#" />
                    </PaginationItem>
                </Pagination>
                <ModalConfirm isOpen={isModalConfirmDeleteOpened} toggle={this.toggleModalDeleteConfirmation} confirmAction={this.deleteMultiEntities} modalHeader="Delete Confirmation">
                    {modalConfirmNote}
                </ModalConfirm>
                <ModalConfirm isOpen={isModalConfirmDeleteSingleOpened} toggle={this.toggleModalDeleteSingleConfirmation} confirmAction={() => {this.callDeleteEntityApi(entityWillBeDeleted); this.toggleModalDeleteSingleConfirmation()}} modalHeader="Delete Confirmation">
                    {modalConfirmNote}
                </ModalConfirm>
                <ModalConfirm isOpen={isModalConfirmPublishOpened} toggle={this.toggleModalPublishConfirmation} confirmAction={this.callPublishEntityApi} modalHeader="Publish Confirmation" >
                    { showPublishProgress ? this.showPublishProgressBar() : modalConfirmNote }
                </ModalConfirm>
            </>
        )
    }
}

export default EntityList;