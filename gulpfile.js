const gulp=require("gulp");

gulp.task("copy",()=>{
	gulp.src(['./src/json/bank.json','./src/json/cardBin.json','./src/json/result.json'])
		.pipe(gulp.dest("./dist/json/"));	
});