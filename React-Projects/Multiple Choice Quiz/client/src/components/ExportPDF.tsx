import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { QuizResults } from 'shared';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

interface ExportPDFProps {
  results: QuizResults;
}

export function ExportPDF({ results }: ExportPDFProps) {
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(33, 33, 33);
      doc.text('Quiz Results', pageWidth / 2, 20, { align: 'center' });

      // Quiz title
      doc.setFontSize(14);
      doc.setTextColor(66, 66, 66);
      doc.text(results.quizTitle, pageWidth / 2, 30, { align: 'center' });

      // Score section
      doc.setFontSize(36);
      const scoreColor = results.score >= 60 ? [34, 139, 34] : [220, 53, 69];
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.text(`${results.score.toFixed(1)}%`, pageWidth / 2, 50, { align: 'center' });

      // Stats
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const statsY = 60;
      doc.text(`Correct: ${results.correctAnswers}/${results.totalQuestions}`, 20, statsY);
      doc.text(`Partial: ${results.partialAnswers}`, 80, statsY);
      doc.text(`Time: ${Math.floor(results.timeTaken / 60)}m ${results.timeTaken % 60}s`, 120, statsY);
      doc.text(`Date: ${formatDate(results.completedAt)}`, 160, statsY);

      // Line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 70, pageWidth - 20, 70);

      // Questions table
      const tableData = results.questions.map((q, index) => {
        const selectedAnswers = q.options
          .filter((o) => o.wasSelected)
          .map((o) => o.text)
          .join(', ') || 'No answer';

        const correctAnswers = q.options
          .filter((o) => o.isCorrect)
          .map((o) => o.text)
          .join(', ');

        const status = q.isCorrect ? 'Correct' : q.score > 0 ? 'Partial' : 'Incorrect';

        return [
          `Q${index + 1}`,
          q.questionText.substring(0, 50) + (q.questionText.length > 50 ? '...' : ''),
          selectedAnswers.substring(0, 30) + (selectedAnswers.length > 30 ? '...' : ''),
          correctAnswers.substring(0, 30) + (correctAnswers.length > 30 ? '...' : ''),
          status,
        ];
      });

      autoTable(doc, {
        startY: 80,
        head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Status']],
        body: tableData,
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
          4: { cellWidth: 25 },
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        didParseCell: (data) => {
          if (data.column.index === 4 && data.section === 'body') {
            const status = data.cell.text[0];
            if (status === 'Correct') {
              data.cell.styles.textColor = [34, 139, 34];
            } else if (status === 'Partial') {
              data.cell.styles.textColor = [255, 165, 0];
            } else {
              data.cell.styles.textColor = [220, 53, 69];
            }
          }
        },
      });

      // Footer
      const pageCount = doc.internal.pages.length - 1;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `MCQ Quiz - Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save
      const fileName = `quiz-results-${results.quizTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({ title: 'PDF Downloaded', description: 'Your results have been exported' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  return (
    <Button variant="outline" onClick={generatePDF}>
      <FileDown className="h-4 w-4 mr-2" />
      Export PDF
    </Button>
  );
}
