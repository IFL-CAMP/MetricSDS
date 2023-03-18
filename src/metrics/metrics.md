# Surgical Phase Recognition Metrics

To provide a quantitative measure of the performance of the surgical phase predictions, we utilize the metrics of Accuracy, Overall accuracy, Precision, Sensitivity, F1, Jaccard Index (IoU), Specificity, Overlap Score, Matthews Correlation Coefficient (MCC) and Cohen's Kappa.

<div style="text-align:center;">
    <img src="./metrics_images/metrics.PNG" alt="alt text" width="250"/>
</div>

**True Positive (TP)** : A test result that correctly indicates the presence of a condition or characteristic [2].<br>
**True Negative (TN)** : A test result that correctly indicates the absence of a condition or characteristic [2].<br>
**False Positive (FP)** : A test result which wrongly indicates that a particular condition or attribute is present [2].<br>
**False Negative (FN)** : A test result which wrongly indicates that a particular condition or attribute is absent [2].<br>

### Micro Average Score

The Micro average score is calculated from the individual classes’ true positives (TPs), true negatives (TNs), false positives (FPs), and false negatives (FNs) of the model. Micro average gives more weight to the majority class and is particularly useful when the classes are imbalanced [3].

### Macro Average Score

Macro average, on the other hand, calculates the performance of each class individually and then takes the unweighted mean of the class-wise performance. Macro average gives equal weight to each class and is useful when all classes are of equal importance [3].

### Accuracy

Accuracy returns an overall measure of how much the model is correctly predicting on the entire set of data. It is one of the most popular metrics in multi-class classification and it is directly computed from the confusion
matrix [4].

<div style="text-align:center;">
    <img src="./metrics_images/accuracy.PNG" alt="alt text" width="250"/>
</div>

```math
\frac{TP + TN}{TP + TN + FP + FN}
```

The formula of the Accuracy considers the sum of True Positive and True Negative elements at the numerator and the
sum of all the entries of the confusion matrix at the denominator. True Positives and True Negatives are the elements
correctly classified by the model and they are on the main diagonal of the confusion matrix, while the denominator also
considers all the elements out of the main diagonal that have been incorrectly classified by the model [4].

### Overall Accuracy

Accuracy returns an overall measure of how much the model is correctly predicting on the entire set of data [4].

```math
\frac{\text{Number of correct predictions}}{\text{Total number of predictions}}
```

### Precision

Precision refers to the percentage of units in our model's predictions that are classified as Positive and are actually Positive. This means that Precision provides us with an understanding of the model's reliability in identifying an individual as Positive [4].

Macro Average Precision and Recall are simply computed as the arithmetic mean of the metrics for single classes [4].

<div style="text-align:center;">
    <img src="./metrics_images/precision.PNG" alt="alt text" width="250"/>
</div>

```math
\frac{TP}{TP+FP}
```

### Sensitivity

The Recall measures the model’s predictive accuracy for the positive class: intuitively, it measures the ability of the
model to find all the Positive units in the dataset [4].

<div style="text-align:center;">
    <img src="./metrics_images/recall_sensitivity.PNG" alt="alt text" width="250"/>
</div>

```math
\frac{TP}{TP+FN}
```

### F1 Score

The formula of F1-score can be interpreted as a weighted average between Precision and Recall, where F1-score reaches
its best value at 1 and worst score at 0. The relative contribution of precision and recall are equal onto the F1-score and
the harmonic mean is useful to find the best trade-off between the two quantities.  Such metrics may have two different specifications,
giving rise to two different metrics: Micro F1-Score and Macro F1-Score [5].

#### Micro F1-Score

In order to obtain Micro F1-Score, we need to compute Micro-Precision and Micro-Recall before.

The idea of Micro-averaging is to consider all the units together, without taking into consideration possible differences
between classes [5]. Therefore, the Micro-Average Precision and Micro-Average Recall are computed as follows:

```math
\frac{\text{2$\times$Precision$\times$Sensitivity }}{\text{Precision + Sensitivity}}
```

#### Macro F1-Score

In order to obtain Macro F1-Score, we need to compute Macro-Precision and Macro-Recall before. They are respectively
calculated by taking the average precision for each predicted class and the average recall for each actual class. Hence,
the Macro approach considers all the classes as basic elements of the calculation: each class has the same weight in the
average, so that there is no distinction between highly and poorly populated classes [5].

Macro F1-Score for each class is the harmonic mean of Macro-Precision and Macro-Recall for each class. Eventually, Macro F1-Score is the average of per class F1 score [5].

```math
\frac{1}{K} \sum_{i=1}^{K} {F}_{i}
```

#### Macro-weighted F1 Score

Macro-weighted scoring takes a weighted mean of the measures. The weights for each class are the total number of samples of that class [6].

### Specificity

The specificity indicates the proportion of negative samples that are correctly predicted as negative. It is also known as True Negative Rate (TNR) [4].

<div style="text-align:center;">
    <img src="./metrics_images/specificity.PNG" alt="alt text" width="250"/>
</div>

```math
\frac{TN}{TN+FP}
```

### Jaccard Index (IoU)

The Jaccard Index, also known as the Jaccard similarity coefficient, is a statistic used in understanding the similarities between sample sets. The measurement emphasizes similarity between finite sample sets, and is formally defined as the size of the intersection divided by the size of the union of the sample sets [8].<br>

<div style="text-align:center;">
    <img src="./metrics_images/iou.png" alt="alt text" width="250"/>
</div>

The mathematical representation of the index is written as:

```math
\frac{|P \cap G| }{ |P \cup G|} 
```

### Overlap Score

This score measures overlap between groundtruth and prediction. It is a function of the longest contiguous predicted segment for a given ground
truth segment [7].

```math
\frac{1}{N} \sum_{i=1}^{N} \max_{j} \frac{\left| y_i \cap \hat{y_j}\right|}{\left| y_i \cup \hat{y_j}\right|}
```

### Matthews Correlation Coefficient (MCC)

The MCC has a scale that ranges from -1 to 1, where values near 1 suggest highly accurate predictions with a strong positive correlation between the predicted and true labels. This implies that the predicted values are very likely to match the actual classification. Conversely, when the MCC equals 0, there is no correlation between the variables, indicating that the classifier randomly assigns units to classes without regard for their true values.
In some cases, MCC can be negative, indicating an inverse relationship between the predicted and true classes [4].

```math
\frac{\text{c} \times \text{s} - \sum p_{k} \times t_{k}}{\sqrt{(s^2 - \sum p^2_{k})(s^2 - \sum t^2_{k})}}
```


$\sum C_{kk} \hspace{1cm} \text{the total number of elements correctly predicted}$
$\sum \sum C_{ij} \hspace{1cm} \text{the total number of elements}$
$\sum C_{ki} \hspace{1cm} \text{the number of times that class k was predicted (column total)}$
$\sum C_{ik} \hspace{0.2cm} \text{the number of times that class k truly occurred (row total)}$

### Cohen's Kappa

Cohen's Kappa measures the concordance between the predicted and true labels, regarding them as two random categorical variables.In the multi-class case, the calculation of Cohen’s Kappa Score changes its structure and it becomes more similar to
Mattheus Correlation Coefficient [4]. 

```math
\frac{p_{agree} - p_{chance}}{1 - p_{chance}}
```

### References
[1] 
[2] Wikipedia contributors. (2023, March 15). Confusion matrix. In Wikipedia, The Free Encyclopedia.
<a href="https://en.wikipedia.org/wiki/Confusion_matrix">[source]</a><br>
[3] Krystian Safjan. (2023). Micro and Macro Averages in Multiclass Multilabel Problems. Creative Commons Attribution-ShareAlike.
<a href="https://safjan.com/micro-and-macro-averages-in-multiclass-multilabel-problems/">[source]</a><br>
[4] Margherita Grandini. Metrics For Multi-Class Classification: An Overview. 2020. 2020.<br>
[5] Yutaka Sasaki et al. The truth of the f-measure. 2007. 2007.<br>
[6] Joydwip Mohajon. (2020). Confusion Matrix for Your Multi-Class Machine Learning Model. Towards Data Science.
<a href="https://towardsdatascience.com/confusion-matrix-for-your-multi-class-machine-learning-model-ff9aa3bf7826#:~:text=Specificity%3A%20It%20tells%20you%20what,recall%20into%20a%20single%20measure">[source]</a><br>
[7] C. Lea, R. Vidal and G. D. Hager. Learning convolutional action primitives for fine grained action recognition. in 2016 IEEE International Conference on Robotics and Automation (ICRA). May 2016. pp. 1642–1649.<br>
[8] Adrian Rosebrock . (2016). Jaccard Index. DeepAI.
<a href="https://deepai.org/machine-learning-glossary-and-terms/jaccard-index">[source]</a><br>
