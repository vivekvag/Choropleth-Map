lambda_handler <- function(){
 
  
  print('Function started today')
  Sys.setenv(RSTUDIO_PANDOC="C:/Program Files/Pandoc/pandoc")
  
  print("Runtime script 13/3/2023 6:26")
  library(rmarkdown)
  find_pandoc(version = "2.9.1")
  
  csv_input_path <- ""
  output_file_name <- "test"
  reports_output_path <- "output/"
  
  input_file <- "test.Rmd"
  rmarkdown::render(input = input_file,
                    params = list(),
                    output_file = paste0("map_op", ".html"))
}

# install.packages("rmarkdown", dep = TRUE)
z <- Sys.getenv("RSTUDIO_PANDOC")
print("z")
print(Sys.getenv("RSTUDIO_PANDOC"))
lambda_handler()

