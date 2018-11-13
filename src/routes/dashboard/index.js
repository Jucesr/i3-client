import React from 'react'
import { connect } from 'react-redux'

import { ProjectItem } from "./components/ProjectItem";
import { loadProjects, selectProject } from "actions/projects";

class DashboardRoute extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
  }

  componentDidMount = () => {
    this.props.loadProjects()
  }

  onSelectProject(id){
    
    this.props.selectProject(id)
    this.props.history.push(`/projects/`)
    
  }

  render(){
    const {
      projects
    } = this.props

    const projectItems = projects.items
    const projectArray = Object.keys(projectItems)

    return (
      <div className="ProjectList">

      {
        projectArray.length > 0 && projectArray.map(key => {
          const item = projectItems[key]
          return (
            <ProjectItem
              onClick={() => this.onSelectProject(item.id)}
              key={item.id}
              id={item.id}
              name={item.name}
              uen={item.uen}
              picture={item.picture_url}
              progress={item.progress}
            />
          )
        })    
      }

      { projects.isFetching && (
          <img className="loader__image" src="/images/loader.gif"></img>
        ) 
      }
      </div>
    )
  }
}


const mapDispatchToProps = (dispatch) => ({
  loadProjects: () => dispatch(loadProjects()),
  selectProject: id => dispatch(selectProject(id))
})

const mapStateToProps = (state) => ({
  projects: state.projects
})


export default connect(
  mapStateToProps,
  mapDispatchToProps, null, {
    pure: false
  })(DashboardRoute)
