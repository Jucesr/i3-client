import React from 'react'
import { Line } from 'rc-progress'

export const ProjectItem = (props) => {

  const {
    id,
    name,
    uen,
    picture,
    progress = 0,
    onClick
  } = props
  let progressColor;
  if(progress <= 33){
    progressColor = "#00cc66" //gren
  }else if(progress <= 66){
    progressColor = "#ff9900" //yellow
  }else{
    progressColor = "#ff3300" //red
  }

  return (
    <div onClick={onClick} className="ProjectItem">
      <div className="ProjectItem-hover">
        <p>{name}</p>
      </div> 

      <div className="ProjectItem-picture">
        <img width="250px" src={`/images/projects/${!!picture ? picture: 'warehouse.png'}`} />
      </div>

      <div className="ProjectItem-progress">
        <p>{`${!!progress ? progress : 0}%`}</p> 
        <Line percent={progress} strokeWidth="4" strokeColor={progressColor} />
      </div>
      
      <div className="ProjectItem-info">
      
        <div className="ProjectItem-name">
          <strong>{name}</strong>
        </div>
        <div className="ProjectItem-uen">
          {uen}
        </div>
      </div>
      
    </div>
  )
}

