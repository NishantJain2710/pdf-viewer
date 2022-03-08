import { useState, useCallback, useEffect } from 'react'
import { Document, Page , pdfjs} from 'react-pdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faPlus, faRotate } from '@fortawesome/free-solid-svg-icons'
import { useIntersectionObserver } from "@wojtekmaj/react-hooks";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const observerConfig = {
    threshold: 0
};

function PageWithObserver({ pageNumber, setPageVisibility, ...otherProps }) {
    const [page, setPage] = useState();
  
    const onIntersectionChange = useCallback(
      ([entry]) => {
        setPageVisibility(pageNumber, entry.isIntersecting);
      },
      [pageNumber, setPageVisibility]
    );
  
    useIntersectionObserver(page, observerConfig, onIntersectionChange);
  
    return <Page canvasRef={setPage} pageNumber={pageNumber} {...otherProps} />;
}

const App = () => {
    const [percentage, setPercentage] = useState(100);
    const [pages, setPages] = useState(0);
    const [visiblePages, setVisiblePages] = useState(0);
    const [currentPages, setCurrentPages] = useState(0);
    const [rotates, setRotate] = useState(0);

    const loadingSuccess = ({numPages}) =>{
        setPages(numPages)
    }

    const setPageVisibility = useCallback((pageNumber, isIntersecting) => {
        setVisiblePages((prevVisiblePages) => ({
            ...prevVisiblePages,
            [pageNumber]: isIntersecting
        }));
    }, []);

    const zoomOut = (e) =>{
        e.preventDefault();
        if(percentage - 25 >= 25){
            setPercentage(percentage - 25)
        }
    }

    const zoomIn = (e) =>{
        e.preventDefault();
        setPercentage(percentage + 25)
    }

    const rotate = (e) => {
        e.preventDefault()
        setRotate(rotates + 90)
    }

    useEffect(()=>{
        const arrOfPages = Object.entries(visiblePages).filter(([key, value])=> value).map(([key])=>key);
        const page = arrOfPages[arrOfPages.length - 1] || 0
        setCurrentPages(Number(page))
    },[visiblePages])

    return (
        <div className="App">
            <div className='pdf-container'>
                <div className='pdf-nav'>
                    <div className='pdf-left-content'>
                        <h5>Sample.pdf</h5>
                    </div>
                    <div className='pdf-center-content'>
                        <div className='pdf-pages'>
                            <input className='pdf-input' readOnly type="number" value={currentPages} onChange={(e)=>setPages(e.target.value)}/> / {pages}
                        </div>
                        <div className='pdf-zoom'>
                            <button onClick={zoomOut}>
                                <FontAwesomeIcon icon={faMinus}/> 
                            </button>
                            <input className='pdf-input' readOnly style={{width:"35px", margin:"0 5px"}} min={0} type="number" value={percentage} onChange={(e)=>setPercentage(e.target.value)}/> 
                            <button  onClick={zoomIn}>
                                <FontAwesomeIcon icon={faPlus}/>
                            </button>
                        </div>
                        <div className='pdf-rotate'>
                            <button onClick={rotate}>
                                <FontAwesomeIcon icon={faRotate} />
                            </button>
                        </div>
                    </div>
                    <div className='pdf-right-content'>

                    </div>
                </div>
                <div className='document-container'>
                    <Document rotate={rotates} className={"pdf-document"} file={'https://yesmentor-admin-content.s3.ap-south-1.amazonaws.com/sample.pdf'} onLoadSuccess={loadingSuccess}>
                        {
                            Array.from(new Array(pages), (el, index)=>(
                                <PageWithObserver
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    setPageVisibility={setPageVisibility}
                                    scale={1 * (percentage/100)}
                                    renderAnnotationLayer={false}
                                    className={`pdf-page  page-number-${index+1}`}
                                />
                            ))
                        }
                    </Document>
                </div>
            </div>
        </div>
    );
}

export default App;
