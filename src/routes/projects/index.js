import React from 'react'
import {connect} from 'react-redux';
import { loadProjects } from "../../store/actions/projects";

class ProjectRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
  }

  componentDidMount = () => {
    
    this.props.loadProjects()
  }

  render(){
    const {projects} = this.props
    const project_list = projects.items


    return (
      <div> 
        <div>This is the project route</div>

        { projects.isFetching ? (
            <img className="loader__image" src="/images/loader.gif"></img>
          ) : (
            <ul>
              {Object.keys(project_list).map(key => (
                <li key={project_list[key].id}> {project_list[key].name} </li>
              ))}
            </ul> 
          )

        }
        
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  loadProjects: () => dispatch(loadProjects())
})

const mapStateToProps = (state) => ({  
  projects: state.projects
})


export default connect(mapStateToProps, mapDispatchToProps)(ProjectRoute);
