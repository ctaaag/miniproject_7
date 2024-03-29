import React, {useEffect, useState} from 'react'
import axios from 'axios';
import NewsList from './NewsList';
import { useSelector } from "react-redux";
import { InewsSearch, newsInfo } from "../Types/userInterface";
import { RootState } from "../"

// 현재 Page DOM 접근 ( ScrollTop ScrollClient ScrollHeight 접근용)
const html:HTMLHtmlElement = document.querySelector("html")!;
const api_key = process.env.REACT_APP_API_KEY;

interface InputValue {
    inputValue: string
}

// Fetch API로 배열 생성 후 map
function NewsContent(props:InputValue) {
    const [fetchNewsList, setFetchNewsList] = useState<InewsSearch[]>([]);
    const [more, setMore] = useState(false)
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false)
    const concatArr:InewsSearch[]= []

    // Axios Fetch Function
    const  FetchFunc = () => {
        // 새로 값을 입력할 때
        if(more === false){
            axios
                .get(`https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=${api_key}&page=0&q=${props.inputValue}&sort=newest`)
                .then((res)=>{
                    setFetchNewsList(concatArr.concat(res.data.response.docs))
                })
                .then(()=>{
                    setIsLoading(false)
                    setMore(state => !state)
                })
                .then(()=>{

                    setTimeout(()=>{
                        if(html.clientHeight === html.scrollHeight){
                            if(isLoading === false){
                                setMore(true)
                                setPage((prev)=>prev+1);
                            }
                        }
                    },1000)
                })
                .catch((err)=>{
                    console.log(err)
                });

        }
        else{
            // infinite scroll Fetch API
            axios
                .get(`https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=${api_key}&page=${page}&q=${props.inputValue}&sort=newest`)
                .then((res)=>{
                    setFetchNewsList(fetchNewsList.concat(res.data.response.docs))
                })
                .then(()=>{
                    setIsLoading(false)
                })
                .catch((err)=>{
                    console.log(err)
                })
                
        }
        
    } 
    
    // Infinite Scroll Observer
    const  scrollHandle = () => {
        if(isLoading === false){
            // 현재 화면의 스크롤 남은 여백과 스크롤 위치를 더한 값이 전체 스크롤 길이와 동일하다면 실행
            // 즉 스크롤이 화면 끝에 도착하였을 때
            if(Math.round(html.clientHeight + html.scrollTop) === html.scrollHeight){
                setMore(true)
                setPage((prev)=>prev+1);
            }
        }
    }

    // Input Value Change 시 Fetch 함수 호출
    useEffect(()=>{
        if(props.inputValue){
        if(isLoading === false){
            setIsLoading(true)
            setPage(0)
            setMore(false)
            FetchFunc();
        }
    }
        window.addEventListener('scroll',scrollHandle)
        return ()=>{window.removeEventListener('scroll',scrollHandle)}
    
    },[props.inputValue])
    
    // Inifinite Scroll 시 Fetch 함수 호출
    useEffect(() => {
        if(props.inputValue){
        if(isLoading === false){
            setIsLoading(true)
            setMore(true)
            FetchFunc();
        }
        }
        window.addEventListener('scroll',scrollHandle)
        
        return ()=>{window.removeEventListener('scroll',scrollHandle)}
    }, [page])

    // Store 전역 상태 관리에서 Clip한 List 호출
    const clipCheck = useSelector((state:RootState) => state)
    const clipList:string[] = [];

    // 호출한 배열을 map 하여 id값만 빈 배열에 병합
    clipCheck.userClipSlice.content.map((clip_list:newsInfo):void => {
        clipList.push(clip_list.id);
    });

    
    return (
        <>
            {fetchNewsList.map((nl:InewsSearch, index:number) => {
                // Clip 여부 확인
                // Fetch된 내용들을 map으로 검사하여 만약 해당 기사의 id가 Store에서 관리하는 id에 포함되어있는지 비교
                let storeClipCheck = false;
                if(clipList.includes(nl._id)){
                    storeClipCheck = true;
                }
                return(
                    <NewsList newscontent={nl} clip={storeClipCheck} key={nl._id}/>
                )
            })}
        </>
    )
}

export default NewsContent
