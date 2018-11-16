export const loadState =  () => {
    try{
        const serializedState = localStorage.getItem('i3_state');
        if( serializedState === null){
            return undefined
        }
        return JSON.parse(serializedState)
    }catch (err){
        return undefined
    }
}

export const saveState = (state) => {
    // try{
    //     const serializedState = JSON.stringify(state)
    //     localStorage.setItem('i3_state', serializedState)
    // } catch (err){
    //     console.log(err)
    // }
}